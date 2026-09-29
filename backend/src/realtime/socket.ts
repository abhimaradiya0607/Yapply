import { createSecretKey, randomUUID } from "node:crypto";
import type { Server as HttpServer } from "node:http";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { Server, type Socket } from "socket.io";

import { db } from "../db/connection.js";
import { users } from "../db/schema/users.schema.js";
import {
  MEETING_CHAT_MAX_LENGTH,
  type MeetingChatErrorPayload,
  type MeetingChatJoinPayload,
  type MeetingChatMessage,
  type MeetingChatSendPayload,
  type MeetingParticipant,
} from "./socket.types.js";

const MAX_ROOM_HISTORY = 100;

const histories = new Map<string, MeetingChatMessage[]>();

declare module "socket.io" {
  interface SocketData {
    user?: MeetingParticipant;
    roomId?: string;
  }
}

const readCookie = (header: string | undefined, name: string) => {
  if (!header) return undefined;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;

    const key = part.slice(0, separator).trim();
    if (key !== name) continue;

    return decodeURIComponent(part.slice(separator + 1).trim());
  }

  return undefined;
};

const normalizeRoomId = (value: unknown) => {
  if (typeof value !== "string") return null;

  const roomId = value.trim();
  if (roomId.length < 1 || roomId.length > 128) return null;
  if (/[\s\u0000-\u001f]/.test(roomId)) return null;

  return roomId;
};

const leaveRoom = (io: Server, socket: Socket) => {
  const roomId = socket.data.roomId;
  if (!roomId) return;

  socket.data.roomId = undefined;
  socket.leave(roomId);

  const room = io.sockets.adapter.rooms.get(roomId);
  const remaining = room ? [...room].filter((id) => id !== socket.id).length : 0;
  if (remaining === 0) histories.delete(roomId);
};

export const connectToSocket = (server: HttpServer) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");

  const secretKey = createSecretKey(secret, "utf-8");
  const origin = process.env.CLIENT_URL || "http://localhost:5173";

  const io = new Server(server, {
    cors: {
      origin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = readCookie(socket.handshake.headers.cookie, "jwt");
      if (!token) {
        next(new Error("Unauthorized"));
        return;
      }

      const { payload } = await jwtVerify(token, secretKey);
      if (typeof payload.id !== "string") {
        next(new Error("Unauthorized"));
        return;
      }

      const [user] = await db
        .select({
          id: users.id,
          fullname: users.fullname,
        })
        .from(users)
        .where(eq(users.id, payload.id))
        .limit(1);

      if (!user) {
        next(new Error("Unauthorized"));
        return;
      }

      socket.data.user = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const reject = (message: string) => {
      const payload: MeetingChatErrorPayload = { message };
      socket.emit("meeting:chat:error", payload);
    };

    socket.on("meeting:chat:join", (payload: MeetingChatJoinPayload) => {
      const roomId = normalizeRoomId(payload?.roomId);
      const user = socket.data.user;
      if (!roomId || !user) {
        reject("Unable to join this conference chat.");
        return;
      }

      if (socket.data.roomId && socket.data.roomId !== roomId) {
        leaveRoom(io, socket);
      }

      socket.data.roomId = roomId;
      socket.join(roomId);
      socket.emit("meeting:chat:history", histories.get(roomId) ?? []);
    });

    socket.on("meeting:chat:send", (payload: MeetingChatSendPayload) => {
      const user = socket.data.user;
      const roomId = socket.data.roomId;

      if (!user || !roomId || !socket.rooms.has(roomId)) {
        reject("You are not in this conference.");
        return;
      }

      const requestedRoom = normalizeRoomId(payload?.roomId);
      if (!requestedRoom || requestedRoom !== roomId) {
        reject("You can't send a message to that conference.");
        return;
      }

      const message = typeof payload?.message === "string" ? payload.message.trim() : "";
      if (!message) {
        reject("Message is empty.");
        return;
      }

      if (message.length > MEETING_CHAT_MAX_LENGTH) {
        reject(`Messages are limited to ${MEETING_CHAT_MAX_LENGTH} characters.`);
        return;
      }

      const chatMessage: MeetingChatMessage = {
        id: randomUUID(),
        roomId,
        senderId: user.id,
        senderName: user.fullname,
        message,
        createdAt: new Date().toISOString(),
      };

      const history = histories.get(roomId) ?? [];
      history.push(chatMessage);
      if (history.length > MAX_ROOM_HISTORY) history.shift();
      histories.set(roomId, history);

      io.to(roomId).emit("meeting:chat:message", chatMessage);
    });

    socket.on("meeting:chat:leave", () => {
      leaveRoom(io, socket);
    });

    socket.on("disconnect", () => {
      leaveRoom(io, socket);
    });
  });

  return io;
};
