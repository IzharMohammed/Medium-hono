import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { PrismaClient } from "@prisma/client";
import { HttpStatusCode } from "../types";
import { ApiResponse } from "../utils/apiResponse";
import { emitSocketEvent } from "../socket";
import { ChatEventEnum } from "../constants";
import { ApiError } from "../utils/ApiError";

const prisma = new PrismaClient();

const getAllMessages = asyncHandler(async (req: Request, res: Response) => {

    const { chatId } = req.params;
    //@ts-ignore
    const userId = req.user.id;

    const selectedChat = await prisma.chat.findUnique({
        where: {
            id: Number(chatId)
        },
        include: {
            participants: true,
            messages: true,
        }
    });
    console.log("selectedChat", selectedChat);

    if (!selectedChat) {
        throw new ApiError(HttpStatusCode.NOT_FOUND, "Chat does not exist");
    }

    if (!selectedChat.participants.some(participant => participant.id === userId)) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, "user is not a part of this chat");
    }

    const messages = await prisma.chatMessage.findMany({
        where: {
            id: Number(chatId)
        },
        orderBy: {
            createdAt: "desc"
        }
    });
console.log("messages",messages);

    res
        .status(HttpStatusCode.OK)
        .json(new ApiResponse(HttpStatusCode.OK, selectedChat || [], "Messages fetched successfully...!!!"));
});

const sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const { content } = req.body;
    //@ts-ignore
    const userId = req.user.id;

    if (!content) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, "Message content or attachment is require");
    }

    const chats = await prisma.chat.findFirst({
        where: {
            id: Number(chatId),
        },
        include: {
            participants: true,
        }
    });

    if (!chats) {
        throw new ApiError(HttpStatusCode.NOT_FOUND, "chats does not exist");
    }

    const message = await prisma.chatMessage.create({
        data: {
            content: content || "",
            sender: {
                connect: {
                    id: Number(userId)
                }
            },
            chat: {
                connect: {
                    id: Number(chatId),
                }
            }
        },
        include: {
            sender: true,
        }
    });

    const chat = await prisma.chat.update({
        where: {
            id: Number(chatId)
        },
        data: {
            lastMessage: { connect: { id: message.id } }
        },
        include: {
            participants: true
        }
    });

    chat.participants.forEach(participant => {
        if (participant.id !== Number(userId)) {
            emitSocketEvent(
                req,
                participant.id.toString(),
                ChatEventEnum.MESSAGE_RECEIVED_EVENT,
                chat
            );
        }
    });


    res
        .status(201)
        .json(new ApiResponse(201, chat, "Message saved successfully"));
});


/* will finish it in future */
// const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
//     const { chatId, messageId } = req.params;

//     //@ts-ignore
//     const userId = req.user.id;

//     const chats = await prisma.chat.findFirst({
//         where: {
//             id: Number(chatId),
//         },
//         include: {
//             participants: true,
//         }
//     });

//     if (!chats) {
//         throw new ApiError(HttpStatusCode.NOT_FOUND, "chats does not exist");
//     }

//     const message = await prisma.chat.findMany({
//         where: {
//             id: Number(messageId)
//         },
//         include: {
//             participants: true,
//             admin: true,

//         }
//     });

//     if (!message) {
//         throw new ApiError(404, "Message does not exist");
//     }

//     if (userId !==message.find(m=>m.)) {
//         throw new ApiError(
//             403,
//             "You are not the authorised to delete the message, you are not the sender"
//         );
//     }

// });

export {
    getAllMessages,
    sendMessage,
    // deleteMessage
}