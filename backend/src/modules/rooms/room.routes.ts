import { Router } from "express";

import { protectRoute } from "../../middlewares/auth.protectroute.js";
import { validateParams } from "../../middlewares/validate.middleware.js";
import { createRoomHandler, getRoomHandler } from "./room.controller.js";
import { roomCodeParamSchema } from "./room.validation.js";

const router = Router();

router.use(protectRoute);

router.post("/", createRoomHandler);
router.get("/:roomCode", validateParams(roomCodeParamSchema), getRoomHandler);

export default router;
