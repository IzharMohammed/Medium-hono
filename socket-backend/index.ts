// Define the port for the server
import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat.routes";
import messageRouter from "./routes/message.routes";
import { InitializeSocketIO } from "./socket";
import { errorHandler } from "./middlewares/error.middlewares";

// Create an Express application
const app = express();
app.use(express.json());
// Create an HTTP server with Express
// const server = http.createServer(app);
export const httpServer = createServer(app);
const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }
})
app.set("io", io); // using set method to mount the `io` instance on the app to avoid usage of `global`

// Apply CORS middleware to allow cross-origin requests
app.use(cors({
    origin:
        process.env.CORS_ORIGIN === "*"
            ? "*"
            : process.env.CORS_ORIGIN?.split(","), // For multiple cors origin for production. Refer https://github.com/hiteshchoudhary/apihub/blob/a846abd7a0795054f48c7eb3e71f3af36478fa96/.env.sample#L12C1-L12C12
    credentials: true
}));

app.use("/api/v1/chat-app/chats", chatRouter);
app.use("/api/v1/chat-app/messages", messageRouter);

app.get("/debug/rooms", (req, res) => {
    const io = req.app.get("io") as Server; // Cast to Server type from socket.io
    const rooms = io.sockets.adapter.rooms;
    
    // Properly typed room data extraction
    const roomData = Array.from(rooms).map(([roomId, socketSet]) => ({
        room: roomId,
        members: Array.from(socketSet as Set<string>) // Explicitly type the Set
    }));
    
    res.json(roomData);
});

// Define a route to handle GET requests to '/test'
app.get('/test', (req, res) => {
    res.json({ msg: "successful" });
});

InitializeSocketIO(io);
app.use(errorHandler);

