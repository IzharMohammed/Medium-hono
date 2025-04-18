import { ChatEventEnum } from "../constants"
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import { Server } from "socket.io";
import { ApiError } from "../utils/ApiError";
import { HttpStatusCode } from "../types";

const prisma = new PrismaClient();

const mountJoinChatEvent = (socket: any) => {
    socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId: string) => {
        console.log(`User joined the chat 🤝. chatId: `, chatId);
        // joining the room with the chatId will allow specific events to be fired where we don't bother about the users like typing events
        // E.g. When user types we don't want to emit that event to specific participant.
        // We want to just emit that to the chat where the typing is happening
        socket.join(chatId);
    });
};

const mountParticipantTypingEvent = (socket: any) => {
    socket.on(ChatEventEnum.TYPING_EVENT, (chatId: string) => {
        socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
    });
};

const mountParticipantStoppedTypingEvent = (socket: any) => {
    socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId: string) => {
        socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
    });
};

const InitializeSocketIO = (io: any) => {
    return io.on("connection", async (socket) => {
        try {

            // parse the cookies from the handshake headers (This is only possible if client has `withCredentials: true`)
            // const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
            // console.log("cookies", cookies);

            let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJhbmRvbUBnbWFpbC5jb20iLCJpZCI6MjcsInVzZXJuYW1lIjoicmFuZG9tIn0.zLnf8vFIDREDSogVrHznWjTWL59dH43io1onCf3T1Bw"// get the accessToken
            console.log("token", token);

            if (!token) {
                // If there is no access token in cookies. Check inside the handshake auth
                token = socket.handshake.auth?.token;
            }

            if (!token) {
                // Token is required for the socket to work
                throw new ApiError(HttpStatusCode.UNAUTHORIZED, "Un-authorized handshake. Token is missing");
            }
            // const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!); // decode the token
            const decodedToken = jwt.verify(token, "secret"); // decode the token

            // console.log("decodedToken", decodedToken);
            //@ts-ignore
            const user = await prisma.user.findUnique({ where: { id: Number(decodedToken.id) } });

            // retrieve the user
            if (!user) {
                throw new Error("Un-authorized handshake. Token is invalid");
            }

            socket.user = user; // mount te user object to the socket

            // We are creating a room with user id so that if user is joined but does not have any active chat going on.
            // still we want to emit some socket events to the user.
            // so that the client can catch the event and show the notifications.
            socket.join(user.id.toString());
            socket.emit(ChatEventEnum.CONNECTED_EVENT); // emit the connected event so that client is aware
            console.log("User connected 🗼. userId: ", user.id.toString());

            // Common events that needs to be mounted on the initialization
            mountJoinChatEvent(socket);
            mountParticipantTypingEvent(socket);
            mountParticipantStoppedTypingEvent(socket);

            socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
                console.log("user has disconnected 🚫. userId: " + socket.user?._id);
                if (socket.user?._id) {
                    socket.leave(socket.user._id);
                }
            });

        } catch (error) {
            socket.emit(
                ChatEventEnum.SOCKET_ERROR_EVENT,
                error?.message || "Something went wrong while connecting to the socket."
            )
        }
    })
};

const emitSocketEvent = (
    // req: Request & { app: { get(name: "io"): Server } },
    req: any,
    roomId: string,
    event: any,
    payload: any): void => {
    req.app.get("io").in(roomId).emit(event, payload);
}

export { emitSocketEvent, InitializeSocketIO };