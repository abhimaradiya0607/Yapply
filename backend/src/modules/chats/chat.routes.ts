import { Router } from "express";
import { protectRoute } from "../../middlewares/auth.protectroute.js";
import { getStreamToken } from "./chat.controller.js";

const router=Router();

router.use(protectRoute);

router.get('/token',getStreamToken);

export default router