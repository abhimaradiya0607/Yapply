import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import LiveRoom from "../components/livekit/LiveRoom";
import RoomMessage from "../components/livekit/RoomMessage";
import { getLiveRoom, roomQueryKeys } from "../lib/api";
import { getLiveKitToken } from "../services/livekit.service";
import {
  clearRoomJoinIntent,
  normalizeRoomCode,
  readRoomJoinIntent,
  type RoomJoinPreferences,
} from "../utils/roomCode";

type JoinLocationState = RoomJoinPreferences & {
  confirmedJoin?: boolean;
};

const LiveRoomPage = () => {
  const { roomCode: rawRoomCode = "" } = useParams();
  const roomCode = normalizeRoomCode(rawRoomCode);
  const navigate = useNavigate();
  const location = useLocation();
  const joinState = location.state as JoinLocationState | null;
  const savedIntent = roomCode ? readRoomJoinIntent(roomCode) : null;
  const confirmedJoin = joinState?.confirmedJoin === true || Boolean(savedIntent);
  const preferences: RoomJoinPreferences = {
    audio: joinState?.audio ?? savedIntent?.audio ?? true,
    video: joinState?.video ?? savedIntent?.video ?? true,
  };
  const leavingRef = useRef(false);
  const [disconnected, setDisconnected] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const roomQuery = useQuery({
    queryKey: roomQueryKeys.detail(roomCode ?? "invalid"),
    queryFn: () => getLiveRoom(roomCode ?? ""),
    enabled: Boolean(roomCode) && confirmedJoin,
    retry: false,
  });

  const tokenQuery = useQuery({
    queryKey: ["livekitToken", roomCode, attempt],
    queryFn: () => getLiveKitToken(roomCode ?? ""),
    enabled: roomQuery.data?.status === "active",
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const backToRooms = () => {
    if (roomCode) clearRoomJoinIntent(roomCode);
    navigate("/live-room", { replace: true });
  };

  if (!roomCode) {
    return (
      <div className="min-h-dvh bg-base-100">
        <RoomMessage
          title="Invalid room code"
          description="Enter a code like YAP-7K4P2Q or paste a meeting link."
          primaryLabel="Back to Live Rooms"
          onPrimary={backToRooms}
        />
      </div>
    );
  }

  if (rawRoomCode !== roomCode) {
    return <Navigate to={`/live-room/${roomCode}`} replace />;
  }

  if (!confirmedJoin) {
    return <Navigate to={`/live-room/${roomCode}/preview`} replace />;
  }

  if (!import.meta.env.VITE_LIVEKIT_URL) {
    return (
      <div className="min-h-dvh bg-base-100">
        <RoomMessage
          title="Live Rooms aren't configured"
          description="The LiveKit server address is missing from this app."
          primaryLabel="Back to Live Rooms"
          onPrimary={backToRooms}
        />
      </div>
    );
  }

  if (roomQuery.isLoading || (roomQuery.data?.status === "active" && tokenQuery.isLoading)) {
    return (
      <div className="min-h-dvh bg-base-100">
        <RoomMessage
          title="Connecting to room..."
          description="Setting up your place in the room."
        />
      </div>
    );
  }

  if (roomQuery.isError || tokenQuery.isError) {
    const error = roomQuery.error ?? tokenQuery.error;
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const offline = axios.isAxiosError(error) && !error.response;

    if (status === 404) {
      return (
        <div className="min-h-dvh bg-base-100">
          <RoomMessage
            title="Room not found"
            description="Check the room code and try again."
            primaryLabel="Back to Live Rooms"
            onPrimary={backToRooms}
          />
        </div>
      );
    }

    if (status === 410) {
      return (
        <div className="min-h-dvh bg-base-100">
          <RoomMessage
            title="Room ended"
            description="This room is no longer available."
            primaryLabel="Back to Live Rooms"
            onPrimary={backToRooms}
          />
        </div>
      );
    }

    if (status === 401) {
      return (
        <div className="min-h-dvh bg-base-100">
          <RoomMessage
            title="Please sign in again"
            description="Your session expired before you could join this room."
            primaryLabel="Back to Live Rooms"
            onPrimary={backToRooms}
          />
        </div>
      );
    }

    return (
      <div className="min-h-dvh bg-base-100">
        <RoomMessage
          title={offline ? "Can't reach Yapply" : "Unable to join room"}
          description={
            offline
              ? "The server is unavailable. Try again in a moment."
              : "Something went wrong while opening this room. Try again."
          }
          primaryLabel="Retry"
          onPrimary={() => {
            void roomQuery.refetch();
            setAttempt((value) => value + 1);
          }}
          secondaryLabel="Back to Live Rooms"
          onSecondary={backToRooms}
        />
      </div>
    );
  }

  if (!roomQuery.data || roomQuery.data.status !== "active" || !tokenQuery.data) {
    return (
      <div className="min-h-dvh bg-base-100">
        <RoomMessage
          title="Room ended"
          description="This room is no longer available."
          primaryLabel="Back to Live Rooms"
          onPrimary={backToRooms}
        />
      </div>
    );
  }

  if (disconnected) {
    return (
      <div className="min-h-dvh bg-base-100">
        <RoomMessage
          title="Disconnected"
          description="The connection to this room was lost."
          primaryLabel="Rejoin"
          onPrimary={() => {
            setDisconnected(false);
            setAttempt((value) => value + 1);
          }}
          secondaryLabel="Back to Live Rooms"
          onSecondary={backToRooms}
        />
      </div>
    );
  }

  return (
    <div className="h-dvh bg-base-100">
      <LiveRoom
        key={attempt}
        token={tokenQuery.data}
        roomCode={roomQuery.data.roomCode}
        audio={preferences.audio}
        video={preferences.video}
        onLeaveStart={() => {
          leavingRef.current = true;
        }}
        onLeave={backToRooms}
        onDisconnected={() => {
          if (!leavingRef.current) setDisconnected(true);
        }}
      />
    </div>
  );
};

export default LiveRoomPage;
