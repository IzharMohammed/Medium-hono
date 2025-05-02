import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";
import { HttpStatusCode } from "../types";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import { emitSocketEvent } from "../socket";
import { ChatEventEnum } from "../constants";
import prisma from "../lib/prisma";

/**
 * Controller to get all chats for the authenticated user
 * Includes both one-on-one and group chats, ordered by most recent activity
 */
const getAllChats = asyncHandler(async (req: Request, res: Response) => {
    //@ts-ignore
    const id = req.user.id;
    console.log("id", id);

    // Fetch all chats where the user is a participant
    const chats = await prisma.chat.findMany({
        where: {
            participants: {
                some: {
                    id
                }
            }
        },
        orderBy: {
            updatedAt: "desc" // Most recently updated chats first
        },
        include: {
            participants: true,
            messages: {
                orderBy: {
                    createdAt: "desc" // Most recent messages first
                }
            }
        }
    });
    // console.log("chats", JSON.stringify(chats));

    res.status(200).json(new ApiResponse(200, chats || [], "User chats fetched successfully"))
});

/**
 * Controller to search for available users to chat with
 * Returns all users in the system
 */
const searchAvailabeUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.status(HttpStatusCode.OK).json(new ApiResponse(HttpStatusCode.OK, users, "Users fetched successfully"));
});

/**
 * Controller to create or get an existing one-on-one chat
 * Checks if chat already exists between two users before creating new one
 */
const createOrGetAOneOnOneChat = asyncHandler(async (req: Request, res: Response) => {
    const { receiverId } = req.params;
    // Check if receiver exists
    const receiver = await prisma.user.findFirst({ where: { id: Number(receiverId) } });

    if (!receiver) throw new ApiError(HttpStatusCode.NOT_FOUND, "Receiver does not exist");

    //@ts-ignore
    const userId = req.user.id;

    // Prevent user from chatting with themselves
    if (receiver.id === userId) throw new ApiError(HttpStatusCode.BAD_REQUEST, "You cannot chat with yourself");

    // Get all one-on-one chats for the current user
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
                messages: true
            }
        });
    console.log("all chats", allChats);

    // Check if chat already exists between these two users
    const existingChat = allChats.find(chat => {
        const ids = chat.participants.map(p => p.id).sort();
        return (
            ids.length === 2 &&
            ids.includes(Number(receiverId)) &&
            ids.includes(userId)
        )
    });
    console.log("existingChat", existingChat);

    // Return existing chat if found
    if (existingChat) {
        res.status(HttpStatusCode.OK).json(new ApiResponse(HttpStatusCode.OK, existingChat, "Chat retrieved successfully"));
    }

    // Create new chat if none exists
    const newChatInstance = await prisma.chat.create({
        data: {
            name: "one to one chat",
            isGroupChat: false,
            participants: {
                connect: [
                    { id: Number(receiverId) },
                    { id: userId }
                ]
            },
            admin: {
                connect: {
                    id: userId
                }
            },
        },
        include: {
            participants: true,
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1, // Include only the most recent message
            },
        }
    });

    console.log("newChatInstance", newChatInstance);

    // Notify the other participant about the new chat via socket
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

/**
 * Controller to create a new group chat
 * Requires at least 3 unique members including the creator
 */
const createAGroupChat = asyncHandler(async (req: Request, res: Response) => {
    const { participants, name } = req.body;
    //@ts-ignore
    const userId = req.user.id;

    // Prevent creator from adding themselves to participants
    if (participants.includes(userId)) {
        throw new ApiError(
            HttpStatusCode.BAD_REQUEST,
            "Participants array should not contain the group creator",
        )
    }

    // Ensure unique members (no duplicates)
    const uniqueMembers = [...new Set([...participants, userId])];

    // Minimum 3 members required for a group
    if (uniqueMembers.length < 3) {
        throw new ApiError(400, "Group must have at least 3 unique members including the creator");
    }

    // Create the group chat in database
    const groupChat = await prisma.chat.create({
        data: {
            admin: {
                connect: {
                    id: userId
                }
            },
            isGroupChat: true,
            participants: {
                connect: uniqueMembers.map(id => ({ id }))
            },
            name
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

    // Notify all participants about the new group via socket
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

/**
 * Controller to get details of a specific group chat
 */
const getGroupChatDetails = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const groupChat = await prisma.chat.findFirst({
        where: {
            id: Number(chatId),
            isGroupChat: true,
        },
        include: {
            admin: true,
            participants: true,
        }
    })

    if (!groupChat) {
        throw new ApiError(HttpStatusCode.NOT_FOUND, "Group chat does not exist");
    }

    res
        .status(200)
        .json(new ApiResponse(200, groupChat, "Group chat fetched successfully"));
});

/**
 * Controller to rename a group chat
 * Only admin can rename the group
 */
const renameGroupChat = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    const { chatId } = req.params;

    // Find the group chat
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
    // Only admin can rename group
    if (groupChat.admin?.id !== userId) throw new ApiError(HttpStatusCode.NOT_FOUND, "You are not an admin");

    // Update group name
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

    // Notify all participants about the name change
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

/**
 * Controller to delete a group chat
 * Only admin can delete the group
 */
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

    // Only admin can delete group
    if (groupChat.admin === userId) throw new ApiError(HttpStatusCode.NOT_FOUND, "Only admin can delete the group");

    // Delete the group chat
    await prisma.chat.delete({
        where: {
            id: Number(chatId)
        }
    });

    // Notify all participants about group deletion
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

/**
 * Controller to remove a participant from group chat
 * Only admin can remove participants
 */
const removeParticipantFromGroupChat = asyncHandler(async (req: Request, res: Response) => {
    const { chatId, participantId } = req.params;
    //@ts-ignore
    const userId = req.user.id;

    // Find the group chat
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

    // Only admin can remove participants
    if (userId !== groupChat.admin?.id) throw new ApiError(HttpStatusCode.FORBIDDEN, "Only admin can remove participants");
    const existingParticipants = groupChat.participants;

    // Check if participant exists in group
    if (!existingParticipants.find(p => p.id === Number(participantId))) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, "Participant does not exist in the group chat");
    }

    // Remove participant from group
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

    // Notify removed participant via socket
    emitSocketEvent(
        req,
        participantId,
        ChatEventEnum.LEAVE_CHAT_EVENT,
        updatedChat
    ),

        res.status(HttpStatusCode.OK).json(new ApiResponse(HttpStatusCode.OK, updatedChat, "Participant removed sucessfully"))
});

/**
 * Controller to add a new participant to group chat
 * Only admin can add participants
 */
const addNewParticipantInGroupChat = asyncHandler(async (req: Request, res: Response) => {
    const { chatId, participantId } = req.params;
    //@ts-ignore
    const userId = req.user.id;

    // Find the group chat
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

    // Only admin can add participants
    if (userId !== groupChat?.admin?.id) throw new ApiError(HttpStatusCode.FORBIDDEN, "Only admin can add participants");

    const existingparticipants = groupChat.participants;

    // Prevent adding duplicate participants
    if (existingparticipants.find(p => p.id === Number(participantId))) throw new ApiError(HttpStatusCode.CONFLICT, "Participant already in group chat");

    // Check if user exists
    const newUserDetails = await prisma.user.findUnique({ where: { id: Number(participantId) } });

    // Add participant to group
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

    // Notify new participant via socket
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

/**
 * Controller for a user to leave a group chat
 * Admin cannot leave the group (must delete or transfer admin first)
 */
const leaveGroupChat = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;

    //@ts-ignore
    const userId = req.user.id;

    // Find the group chat
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

    // Check if user is actually in the group
    if (!existingParticipants.find(p => p.id === Number(userId))) throw new ApiError(HttpStatusCode.BAD_REQUEST, "You are not a part of this group chat");

    // Remove user from group participants
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

    // Notify group about user leaving
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

// TODO: Implement one-on-one chat deletion
const deleteOneOnOneChat = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;

    const [_, chat] = await prisma.$transaction([
        prisma.chatMessage.deleteMany({
            where: {
                chatId: Number(chatId)
            }
        }),
        prisma.chat.delete({
            where: {
                id: Number(chatId)
            }
        })
    ])

    res
        .status(200)
        .json(new ApiResponse(200, chat, "Removed successfully"));

});

// Export all chat controllers
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