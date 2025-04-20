import { ChatEventEnum } from "../constants";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import { Server } from "socket.io";
import { ApiError } from "../utils/ApiError";
import { HttpStatusCode } from "../types";
import cookie from "cookie";

const prisma = new PrismaClient();

// Enhanced with debugging
const mountJoinChatEvent = (socket: any, io: any) => {
    socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId: string, callback) => {
        console.log(`[${socket.id}] Joining chat room: ${chatId}`);

        // Leave any previous chat rooms to avoid duplicates
        Array.from(socket.rooms).forEach(room => {
            if (room !== socket.id && room !== socket.user?.id.toString()) {
                socket.leave(room);
                console.log(`[${socket.id}] Left room: ${room}`);
            }
        });

        socket.join(chatId);
        console.log(`[${socket.id}] Joined room: ${chatId}`);

        // Send acknowledgement
        if (typeof callback === 'function') {
            callback({
                success: true,
                room: chatId,
                currentMembers: io.sockets.adapter.rooms.get(chatId)?.size || 0
            });
        }

        // Debug current rooms
        console.log(`[${socket.id}] Current rooms:`, Array.from(socket.rooms));
    });
};

const mountParticipantTypingEvent = (socket: any) => {
    socket.on(ChatEventEnum.TYPING_EVENT, (chatId: string) => {
        console.log(`[${socket.id}] Typing in chat: ${chatId}`);
        socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT,
            chatId,
            // userId: socket.user?.id
        );
    });
};

const mountParticipantStoppedTypingEvent = (socket: any) => {
    socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId: string) => {
        console.log(`[${socket.id}] Stopped typing in chat: ${chatId}`);
        socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT,
            chatId,
            // userId: socket.user?.id
        );
    });
};

const InitializeSocketIO = (io: Server) => {
    return io.on("connection", async (socket) => {
        try {
            console.log(`\n=== New connection: ${socket.id} ===`);
            let token = socket.handshake.auth?.token;
            console.log("Auth token:", token);

            if (!token) {
                // Check cookies if not in auth
                const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
                token = cookies?.accessToken;
                console.log("Cookie token:", token);
            }

            if (!token) {
                // As last resort, check query params
                token = socket.handshake.query?.token as string;
                console.log("Query token:", token);
            }

            if (!token) {
                throw new ApiError(HttpStatusCode.UNAUTHORIZED, "Unauthorized handshake. Token is missing");
            }
            // Authentication
            // let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJhbmRvbUBnbWFpbC5jb20iLCJpZCI6MjcsInVzZXJuYW1lIjoicmFuZG9tIn0.zLnf8vFIDREDSogVrHznWjTWL59dH43io1onCf3T1Bw";
            const decodedToken = jwt.verify(token, "secret");
            //@ts-ignore
            const user = await prisma.user.findUnique({ where: { id: Number(decodedToken.id) } });

            if (!user) {
                throw new Error("Unauthorized handshake. Token is invalid");
            }

            //@ts-ignore
            socket.user = user;
            console.log(`Authenticated user: ${user.id} (${user.email})`);

            // Join user's personal room
            socket.join(user.id.toString());
            console.log(`[${socket.id}] Joined personal room: ${user.id}`);

            // Mount event listeners
            mountJoinChatEvent(socket, io);
            mountParticipantTypingEvent(socket);
            mountParticipantStoppedTypingEvent(socket);

            // Debug endpoint
            socket.on('getMyRooms', (callback) => {
                if (typeof callback === 'function') {
                    callback({
                        rooms: Array.from(socket.rooms),
                        userRooms: Array.from(socket.rooms).filter(r => r !== socket.id)
                    });
                }
            });

            // Connection established
            socket.emit(ChatEventEnum.CONNECTED_EVENT, {
                socketId: socket.id,
                userId: user.id.toString()
            });

            // Disconnect handler
            socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
                console.log(`[${socket.id}] Disconnected. User ID: ${user.id}`);
                socket.leave(user.id.toString());
            });

            // Error handler
            socket.on('error', (error) => {
                console.error(`[${socket.id}] Error:`, error);
            });

        } catch (error) {
            console.error(`Connection error [${socket.id}]:`, error);
            socket.emit(
                ChatEventEnum.SOCKET_ERROR_EVENT,
                error?.message || "Socket connection error"
            );
            socket.disconnect(true);
        }
    });
};

const emitSocketEvent = (req: any, roomId: string, event: string, payload: any): void => {
    const io = req.app.get("io");

    console.log(`\n=== Emitting to room: ${roomId} ===`);
    console.log(`Event: ${event}`);
    console.log(`Payload:`, payload);

    // Debug room info
    const room = io.sockets.adapter.rooms.get(Number(roomId));
    console.log(`Room:- ${Array.from(room)} Room members:- ${room?.size || 0}`);
    if (room) {
        console.log(`Member socket IDs:`, Array.from(room));
    } else {
        console.warn(`Room ${roomId} does not exist or is empty`);
    }

    io.in(Number(roomId)).emit(event, payload);
};

export { emitSocketEvent, InitializeSocketIO };