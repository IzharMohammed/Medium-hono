import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";
import { HttpStatusCode } from "../types";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import { emitSocketEvent } from "../socket";
import { ChatEventEnum } from "../constants";

const prisma = new PrismaClient();

const getAllChats = asyncHandler(async (req: Request, res: Response) => {
    //@ts-ignore
    const id = req.user.id;
    const chats = await prisma.chat.findMany({
        where: {
            id
        },
        orderBy: {
            updatedAt: "desc"
        },
        include: {
            participants: true,
            messages: {
                orderBy: {
                    createdAt: "desc"
                }
            }
        }
    });

    res.status(HttpStatusCode.OK).json(new ApiResponse(HttpStatusCode.OK, chats || [], "User chats fetched successfully"))
});

const searchAvailabeUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.status(HttpStatusCode.OK).json(new ApiResponse(HttpStatusCode.OK, users, "Users fetched successfully"));
});

const createOrGetAOneOnOneChat = asyncHandler(async (req: Request, res: Response) => {
    const { receiverId } = req.params;
    const receiver = await prisma.user.findFirst({ where: { id: Number(receiverId) } });

    if (!receiver) throw new ApiError(HttpStatusCode.NOT_FOUND, "Receiver does not exist");

    //@ts-ignore
    const userId = req.user.id;

    if (receiver.id === userId) throw new ApiError(HttpStatusCode.BAD_REQUEST, "You cannot chat with yourself");

    const allChats = await prisma.chat.findMany(
        {
            where:
            {
                isGroupChat: false,
                participants: {
                    some: {
                        id: userId
                    }
                }
            },
            include: {
                participants: true,
            }
        });

    const existingChat = allChats.find(chat => {
        const ids = chat.participants.map(p => p.id).sort();
        return (
            ids.length === 2 &&
            ids.includes(Number(receiverId)) &&
            ids.includes(userId)
        )
    });

    if (existingChat) {
        res.status(HttpStatusCode.OK).json(new ApiResponse(HttpStatusCode.OK, existingChat[0], "Chat retrieved successfully"));
    }

    const newChatInstance = await prisma.chat.create({
        data: {
            name: "one to one chat",
            isGroupChat: false,
            participants: {
                connect: [
                    { id: receiverId },
                    { id: userId }
                ]
            },
            admin: userId,

        },
        include: {
            participants: true,
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        }
    })

    newChatInstance.participants.forEach((participant) => {
        if (participant.id === userId) return;
        emitSocketEvent(
            req,
            participant.id.toString(),
            ChatEventEnum.NEW_CHAT_EVENT,
            newChatInstance
        )
    })

    res
        .status(201)
        .json(new ApiResponse(201, newChatInstance, "Chat retrieved successfully"));
});

const createAGroupChat = asyncHandler(async (req: Request, res: Response) => {
    const { participants } = req.body;
    //@ts-ignore
    const userId = req.user.id;
    if (participants.includes(userId)) {
        throw new ApiError(
            HttpStatusCode.BAD_REQUEST,
            "Participants array should not contain the group creator",
        )
    }

    const uniqueMembers = [...new Set([...participants, userId])];

    if (uniqueMembers.length < 3) {
        throw new ApiError(400, "Group must have at least 3 unique members including the creator");
    }

    const groupChat = await prisma.chat.create({
        data: {
            admin: userId,
            isGroupChat: true,
            participants: {
                connect: uniqueMembers.map(id => id)
            },
            name: "Group chat"
        },
        include: {
            participants: true,
            messages: { orderBy: { createdAt: "desc" } },
        }
    });

    if (!groupChat) {
        throw new ApiError(
            HttpStatusCode.INTERNAL_SERVER_ERROR,
            "Internal server error"
        );
    }

    groupChat.participants.forEach((participant) => {
        if (participant.id === userId) return;
        emitSocketEvent(
            req,
            participant.id.toString(),
            ChatEventEnum.NEW_CHAT_EVENT,
            groupChat
        )
    });

    res
        .status(201)
        .json(new ApiResponse(201, groupChat, "Group chat created successfully"));

});

const getGroupChatDetails = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.body;
    const groupChat = await prisma.chat.findFirst({
        where: {
            id: chatId,
            isGroupChat: true,
        }
    })

    if (!groupChat) {
        throw new ApiError(HttpStatusCode.NOT_FOUND, "Group chat does not exist");
    }

    res
        .status(200)
        .json(new ApiResponse(200, groupChat, "Group chat fetched successfully"));

});

const renameGroupChat = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    const { chatId } = req.params;

    const groupChat = await prisma.chat.findUnique({
        where: {
            id: Number(chatId),
            isGroupChat: true
        },
        include: {
            participants: true,
            admin: true
        }
    });

    if (!groupChat) {
        throw new ApiError(HttpStatusCode.NOT_FOUND, "Group chat does not exist")
    }

    //@ts-ignore
    const userId = req.user.id;
    if (groupChat.admin?.id === userId) throw new ApiError(HttpStatusCode.NOT_FOUND, "You are not an admin");

    const updatedGroupChat = await prisma.chat.update({
        where: {
            id: Number(chatId)
        },
        data: {
            name
        },
        include: {
            participants: true
        }
    });

    if (!updatedGroupChat) throw new ApiError(HttpStatusCode.BAD_REQUEST, "Internal server error");

    updatedGroupChat.participants.forEach((participant) => {
        if (participant.id === userId) return;
        emitSocketEvent(
            req,
            participant.id.toString(),
            ChatEventEnum.UPDATE_GROUP_NAME_EVENT,
            updatedGroupChat
        )
    });

    res
        .status(200)
        .json(
            new ApiResponse(200, updatedGroupChat, "Group chat name updated successfully")
        );

});

const deleteGroupChat = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const groupChat = await prisma.chat.findFirst({
        where: {
            id: Number(chatId),
            isGroupChat: true
        },
        include: {
            admin: true,
            participants: true,
        }
    });

    if (!groupChat) throw new ApiError(HttpStatusCode.NOT_FOUND, "No group exist");

    //@ts-ignore
    const userId = req.user.id;

    if (groupChat.admin === userId) throw new ApiError(HttpStatusCode.NOT_FOUND, "Only admin can delete the group");

    await prisma.chat.delete({
        where: {
            id: Number(chatId)
        }
    });

    groupChat.participants.forEach((participant) => {
        if (participant.id === userId) return;
        emitSocketEvent(
            req,
            participant.id.toString(),
            ChatEventEnum.LEAVE_CHAT_EVENT,
            groupChat
        )
    });


    res
        .status(200)
        .json(new ApiResponse(200, {}, "Group chat deleted successfully"));

});

const removeParticipantFromGroupChat = asyncHandler(async (req: Request, res: Response) => {
    const { chatId, participantId } = req.params;
    //@ts-ignore
    const userId = req.user.id;
    const groupChat = await prisma.chat.findFirst({
        where: {
            id: Number(chatId),
            isGroupChat: true,
        },
        include: {
            admin: true,
            participants: true,
        }
    });

    if (!groupChat) throw new ApiError(HttpStatusCode.NOT_FOUND, "Group chat not found");

    if (userId !== groupChat.admin?.id) throw new ApiError(HttpStatusCode.FORBIDDEN, "Only admin can remove participants");
    const existingParticipants = groupChat.participants;

    if (!existingParticipants.find(p => p.id === Number(participantId))) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, "Participant does not exist in the group chat");
    }

    const updatedChat = await prisma.chat.update({
        where: {
            id: Number(chatId)
        },
        data: {
            participants: {
                disconnect: {
                    id: Number(participantId)
                }
            }
        },
        include: {
            participants: true,
            admin: true,
        }
    })

    emitSocketEvent(
        req,
        participantId,
        ChatEventEnum.LEAVE_CHAT_EVENT,
        updatedChat
    ),

        res.status(HttpStatusCode.OK).json(new ApiResponse(HttpStatusCode.OK, updatedChat, "Participant removed sucessfully"))

});

const addNewParticipantInGroupChat = asyncHandler(async (req: Request, res: Response) => {
    const { chatId, participantId } = req.params;
    //@ts-ignore
    const userId = req.user.id;
    const groupChat = await prisma.chat.findFirst({
        where: {
            id: Number(chatId),
            isGroupChat: true,
        },
        include: {
            participants: true,
            admin: true,
        }
    })

    if (!groupChat) throw new ApiError(HttpStatusCode.NOT_FOUND, "Group chat not found");

    if (userId !== groupChat?.admin?.id) throw new ApiError(HttpStatusCode.FORBIDDEN, "Only admin can add participants");

    const existingparticipants = groupChat.participants;

    if (existingparticipants.find(p => p.id === Number(participantId))) throw new ApiError(HttpStatusCode.CONFLICT, "Participant already in group chat");

    const newUserDetails = await prisma.user.findUnique({ where: { id: Number(participantId) } });

    const updatedChats = await prisma.chat.update({
        where: {
            id: Number(chatId)
        },
        data: {
            participants: {
                connect: {
                    id: Number(participantId)
                }
            }
        },
        include: {
            participants: true,
            admin: true
        }
    });

    emitSocketEvent(
        req,
        participantId,
        ChatEventEnum.NEW_CHAT_EVENT,
        updatedChats
    );

    res
        .status(HttpStatusCode.OK)
        .json(
            new ApiResponse(HttpStatusCode.OK, updatedChats, "Participant added successfully")
        );

});

const leaveGroupChat = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;

    //@ts-ignore
    const userId = req.user.id;

    const groupChat = await prisma.chat.findFirst({
        where: {
            id: Number(chatId),
            isGroupChat: true,
        },
        include: {
            admin: true,
            participants: true
        }
    });

    if (!groupChat) throw new ApiError(HttpStatusCode.NOT_FOUND, "Group chat does not exist");

    const existingParticipants = groupChat.participants;

    if (!existingParticipants.find(p => p.id === Number(userId))) throw new ApiError(HttpStatusCode.BAD_REQUEST, "You are not a part of this group chat");

    const updatedChat = await prisma.chat.update({
        where: {
            id: Number(chatId)
        },
        data: {
            participants: {
                disconnect: {
                    id: Number(userId)
                }
            }
        },
        include: {
            participants: true,
            admin: true
        }
    });

    emitSocketEvent(
        req,
        chatId,
        ChatEventEnum.LEAVE_CHAT_EVENT,
        updatedChat
    );

    res
        .status(200)
        .json(new ApiResponse(200, updatedChat, "Left a group successfully"));
});

const deleteOneOnOneChat = asyncHandler(async (req: Request, res: Response) => { });

export {
    getAllChats,
    searchAvailabeUsers,
    createOrGetAOneOnOneChat,
    createAGroupChat,
    getGroupChatDetails,
    renameGroupChat,
    deleteGroupChat,
    removeParticipantFromGroupChat,
    addNewParticipantInGroupChat,
    leaveGroupChat,
    deleteOneOnOneChat
}