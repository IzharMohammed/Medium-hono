import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { PrismaClient } from "@prisma/client";
import { HttpStatusCode } from "../types";
import { ApiResponse } from "../utils/apiResponse";

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

});

export {
    getAllChats,
    searchAvailabeUsers,
    createOrGetAOneOnOneChat
}