import { z } from "zod";

export const ROOM_CODE_PATTERN = /^YAP-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

export const roomCodeParamSchema = z.object({
  roomCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(ROOM_CODE_PATTERN, "Invalid room code"),
});
