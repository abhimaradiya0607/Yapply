export const MEETING_CHAT_MAX_LENGTH = 1000;

export type MeetingParticipant = {
  id: string;
  fullname: string;
};

export type MeetingChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
};

export type MeetingChatJoinPayload = {
  roomId: string;
};

export type MeetingChatSendPayload = {
  roomId: string;
  message: string;
};

export type MeetingChatErrorPayload = {
  message: string;
};
