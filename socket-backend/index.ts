// Define the port for the server
const PORT = 4000;

import express from "express";
import cors from "cors";
import http from "http";
// Create an Express application
const app = express();
app.use(express.json());
// Create an HTTP server with Express
const server = http.createServer(app);

// Apply CORS middleware to allow cross-origin requests
app.use(cors());

// Define a route to handle GET requests to '/test'
app.get('/test', (req, res) => {
    res.json({ msg: "successful" });
});


let globalRoomId = '';   // Global variable for room ID
let allUserIds = [];

function createGlobalVariables(roomId) {
    globalRoomId = roomId;
    // allUserIds = userIds;
}

app.post('/api/create-room', (req, res) => {
    const { roomId, userIds } = req.body;
    console.log('roomid', roomId);
    console.log('userIds', userIds);
    //   createGlobalVariables(roomId, userIds);

    //console.log(`senderId: ${senderId}, receiverId: ${receiverId}`);
    //console.log(response);
    // userIds.forEach(userId => {
    //     socketIo.to(userId).emit('join_room', req.body);
    // })
    res.json({ msg: "successul in entering" })
})

// Initialize Socket.IO with the HTTP server and configure CORS
const socketIo = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:5173"  // Allow requests from this origin
    }
});

// Handle WebSocket connections
socketIo.on("connection", (socket) => {
    // Log when a client connects
    console.log(`${socket.id}: connected`);

    // Listen for 'message' events from clients
    socket.on("message", (data) => {
        // Log the received message data
        console.log('message', data);
        // Broadcast the message data to all connected clients
        socketIo.emit("messageResponse", data);
    });

    socket.on('join_room', (roomId) => {

        const [_, senderId, receiverId] = roomId.split('_');
        // console.log(`senderId: ${senderId},receiverId: ${receiverId} `);
        createGlobalVariables(roomId)

        console.log(`user 1 :${allUserIds[0]}, user 2 : ${allUserIds[1]}`);

        // if (parseInt(senderId) == allUserIds[0] || allUserIds[1] && parseInt(receiverId) == allUserIds[0] || allUserIds[1]) {
        //     socket.join(roomId);
        //     console.log(`${roomId} created`);
        // }

        if (senderId && receiverId) {
            socket.join(roomId);
            console.log(`${roomId} created`);

        }
    })

    // Handle client disconnection
    socket.on("disconnect", () => {
        // Log when a client disconnects
        console.log('disconnected');
    });
});


// Start the HTTP server and listen on the defined port
server.listen(PORT, () => {
    console.log(`server is up on port: ${PORT}`);
});
