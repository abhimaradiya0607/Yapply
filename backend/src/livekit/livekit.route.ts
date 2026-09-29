import express from "express";
import { getLiveKitToken } from "./livekit.controller.js";
import { protectRoute } from "../middlewares/auth.protectroute.js";

const router = express.Router();

router.post("/token", protectRoute, getLiveKitToken);

export default router;