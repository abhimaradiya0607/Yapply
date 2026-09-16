import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import friendRoutes from './modules/friends/friends.routes.js'
import chatRoutes from './modules/chats/chat.routes.js'


const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/api/auth',authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/friend-request',friendRoutes);
app.use('/api/chat',chatRoutes);



app.get("/", (_req, res) => {
  res.json({ message: "Yapply API is running" });
});

export default app;
