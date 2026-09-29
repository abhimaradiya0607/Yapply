const ROOM_CODE_PATTERN = /YAP-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}/;

export type RoomJoinPreferences = {
  audio: boolean;
  video: boolean;
};

const joinIntentKey = (roomCode: string) => `yapply:live-room:join:${roomCode}`;

export const normalizeRoomCode = (input: string): string | null => {
  const trimmed = input.trim().toUpperCase();
  if (!trimmed) return null;

  const match = trimmed.match(ROOM_CODE_PATTERN);
  return match?.[0] ?? null;
};

export const roomShareUrl = (roomCode: string) =>
  `${window.location.origin}/live-room/${roomCode}`;

export const markRoomJoined = (
  roomCode: string,
  preferences: RoomJoinPreferences,
) => {
  sessionStorage.setItem(joinIntentKey(roomCode), JSON.stringify(preferences));
};

export const readRoomJoinIntent = (roomCode: string): RoomJoinPreferences | null => {
  const raw = sessionStorage.getItem(joinIntentKey(roomCode));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<RoomJoinPreferences>;
    if (typeof parsed.audio !== "boolean" || typeof parsed.video !== "boolean") {
      return null;
    }

    return { audio: parsed.audio, video: parsed.video };
  } catch {
    return null;
  }
};

export const clearRoomJoinIntent = (roomCode: string) => {
  sessionStorage.removeItem(joinIntentKey(roomCode));
};
