import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import {
  MEETING_CHAT_MAX_LENGTH,
  type MeetingChatErrorPayload,
  type MeetingChatMessage,
} from "../../types/meeting-chat";

const socketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  return apiUrl.replace(/\/api\/?$/, "");
};

const sameRoom = (messages: MeetingChatMessage[], roomId: string) =>
  messages.filter((message) => message.roomId === roomId);

const mergeMessages = (current: MeetingChatMessage[], incoming: MeetingChatMessage[]) => {
  const byId = new Map<string, MeetingChatMessage>();

  for (const message of [...current, ...incoming]) {
    byId.set(message.id, message);
  }

  return [...byId.values()].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
};

export const useMeetingChat = (roomId: string | undefined) => {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<MeetingChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    setMessages([]);
    setError(null);
    setConnected(false);

    const socket = io(socketUrl(), {
      withCredentials: true,
      autoConnect: true,
    });
    socketRef.current = socket;

    const onMessage = (message: MeetingChatMessage) => {
      if (message.roomId !== roomId) return;
      setMessages((current) => mergeMessages(sameRoom(current, roomId), [message]));
    };

    const onHistory = (history: MeetingChatMessage[]) => {
      setMessages((current) => mergeMessages(sameRoom(current, roomId), sameRoom(history, roomId)));
    };

    const onError = (payload: MeetingChatErrorPayload) => {
      setError(payload.message);
    };

    const onConnect = () => {
      setConnected(true);
      setError(null);
      socket.emit("meeting:chat:join", { roomId });
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    socket.on("meeting:chat:message", onMessage);
    socket.on("meeting:chat:history", onHistory);
    socket.on("meeting:chat:error", onError);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onDisconnect);

    return () => {
      socket.emit("meeting:chat:leave");
      socket.off("meeting:chat:message", onMessage);
      socket.off("meeting:chat:history", onHistory);
      socket.off("meeting:chat:error", onError);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onDisconnect);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const sendMessage = (value: string) => {
    const message = value.trim();
    const socket = socketRef.current;

    if (!roomId || !message || !socket?.connected) return false;
    if (message.length > MEETING_CHAT_MAX_LENGTH) {
      setError(`Messages are limited to ${MEETING_CHAT_MAX_LENGTH} characters.`);
      return false;
    }

    setError(null);
    socket.emit("meeting:chat:send", { roomId, message });
    return true;
  };

  return {
    messages,
    connected,
    error,
    sendMessage,
  };
};
