import type { Request, Response } from "express";

import { AppError } from "../../utils/app-error.js";
import { createRoom, getRoomByCode } from "./room.service.js";

const toRoomResponse = (
  room: NonNullable<Awaited<ReturnType<typeof getRoomByCode>>>,
  userId: string,
) => ({
  id: room.id,
  roomCode: room.roomCode,
  hostId: room.hostId,
  status: room.status,
  isHost: room.hostId === userId,
  createdAt: room.createdAt.toISOString(),
  endedAt: room.endedAt ? room.endedAt.toISOString() : null,
});

const sendError = (res: Response, error: unknown) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Room error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export const createRoomHandler = async (req: Request, res: Response) => {
  try {
    const hostId = req.user?.id;

    if (!hostId) {
      throw new AppError("Unauthorized", 401);
    }

    const room = await createRoom(hostId);

    return res.status(201).json({
      success: true,
      room: toRoomResponse(room, hostId),
    });
  } catch (error) {
    return sendError(res, error);
  }
};

type RoomCodeParams = {
  roomCode: string;
};

export const getRoomHandler = async (
  req: Request<RoomCodeParams>,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const room = await getRoomByCode(req.params.roomCode);

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    return res.status(200).json({
      success: true,
      room: toRoomResponse(room, userId),
    });
  } catch (error) {
    return sendError(res, error);
  }
};
