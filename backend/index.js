import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connect from './src/connect/connect.js';
import userRoutes from './src/routes/userRoutes.js'
import chatRoutes from './src/routes/chatRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';

dotenv.config();
const PORT = process.env.PORT || 4500;

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "https://chat-app-mern-socket-io-ezti-rntuzjn6q.vercel.app/",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(express.json());
app.use(cors({ 
    credentials: true, 
    origin: "https://chat-app-mern-socket-io-ezti-rntuzjn6q.vercel.app/" 
}));

// Routes for user authentication
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    
    // User joins their personal room
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    // User joins a chat room
    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    // Handle typing indicators
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    // Handle new message
    socket.on("new message", (newMessageReceived) => {
        const chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED");
    });
});

server.listen(PORT, () => {
    connect();
    console.log(`Server is running on ${PORT}`);
});