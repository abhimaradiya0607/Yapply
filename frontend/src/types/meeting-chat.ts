export const MEETING_CHAT_MAX_LENGTH = 1000;

export type MeetingChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
};

export type MeetingChatErrorPayload = {
  message: string;
};
