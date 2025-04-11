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

export {
    getAllChats,
    searchAvailabeUsers,
    createOrGetAOneOnOneChat,
    createAGroupChat
}