import { randomInt } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "../../db/connection.js";
import { rooms } from "../../db/schema/index.js";
import { AppError } from "../../utils/app-error.js";

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateRoomCode = () => {
  let suffix = "";

  for (let index = 0; index < 6; index += 1) {
    suffix += ROOM_CODE_ALPHABET[randomInt(ROOM_CODE_ALPHABET.length)];
  }

  return `YAP-${suffix}`;
};

const isUniqueViolation = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;

  if ("code" in error && error.code === "23505") return true;

  if ("cause" in error) return isUniqueViolation(error.cause);

  return false;
};

export const createRoom = async (hostId: string) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const [room] = await db
        .insert(rooms)
        .values({
          hostId,
          roomCode: generateRoomCode(),
        })
        .returning();

      if (!room) {
        throw new AppError("Unable to create room", 500);
      }

      return room;
    } catch (error) {
      if (isUniqueViolation(error) && attempt < 4) continue;
      throw error;
    }
  }

  throw new AppError("Unable to create a unique room code", 500);
};

export const getRoomByCode = async (roomCode: string) => {
  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.roomCode, roomCode))
    .limit(1);

  return room ?? null;
};
