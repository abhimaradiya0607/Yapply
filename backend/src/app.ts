import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from './modules/auth/auth.routes.js'


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

app.get("/", (_req, res) => {
  res.json({ message: "Yapply API is running" });
});

export default app;
