import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import friendRoutes from './modules/friends/friends.routes.js'
import chatRoutes from './modules/chats/chat.routes.js'
import notificationRoutes from './modules/notifications/notification.routes.js'
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import { connectToSocket } from './realtime/socket.js';
import liveKitRouter from './livekit/livekit.route.js';
import roomRoutes from './modules/rooms/room.routes.js';

const app = express();
// const server = createServer(app);
// const io = connectToSocket(new Server(server));


app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());


app.use('/api/auth',authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/friend-request',friendRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/livekit", liveKitRouter);
app.use("/api/rooms", roomRoutes);



app.get("/", (_req, res) => {
  res.json({ message: "Yapply API is running" });
});

export default app;
