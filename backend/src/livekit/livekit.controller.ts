import type { Request, Response } from "express";

import { getRoomByCode } from "../modules/rooms/room.service.js";
import { ROOM_CODE_PATTERN } from "../modules/rooms/room.validation.js";
import { createLiveKitToken } from "./livekit.service.js";

export const getLiveKitToken = async (req: Request, res: Response) => {
    try {
        const rawRoomName = req.body?.roomName;
        const roomName =
            typeof rawRoomName === "string" ? rawRoomName.trim().toUpperCase() : "";

        if (!roomName) {
            return res.status(400).json({
                success: false,
                message: "Room name is required",
            });
        }

        if (!ROOM_CODE_PATTERN.test(roomName)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room code",
            });
        }

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const room = await getRoomByCode(roomName);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        if (room.status !== "active") {
            return res.status(410).json({
                success: false,
                message: "This room has ended",
            });
        }

        const token = await createLiveKitToken(
            req.user.id,
            room.roomCode,
            req.user.fullname || "Learner",
        );

        return res.status(200).json({
            success: true,
            token,
        });
    } catch (error) {
        console.error("LiveKit token error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate LiveKit token",
        });
    }
};
