import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Zap } from "lucide-react";
import toast, { LoaderIcon } from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import LiveRoomPreviewPanel from "../components/livekit/LiveRoomPreviewPanel";
import LocalMediaPreview from "../components/livekit/LocalMediaPreview";
import RoomMessage from "../components/livekit/RoomMessage";
import useAuthUser from "../hooks/useAuthUser";
import { getLiveRoom, roomQueryKeys } from "../lib/api";
import {
  clearRoomJoinIntent,
  markRoomJoined,
  normalizeRoomCode,
  roomShareUrl,
} from "../utils/roomCode";

const mediaErrorCopy = (error: Error) => {
  const denied =
    error.name === "NotAllowedError" || error.name === "PermissionDeniedError";
  const missing =
    error.name === "NotFoundError" || error.name === "DevicesNotFoundError";
  const busy = error.name === "NotReadableError" || error.name === "TrackStartError";

  if (denied) {
    return "Camera or microphone permission was denied. You can still join with them off.";
  }

  if (missing) {
    return "No camera or microphone was found. You can still join with them off.";
  }

  if (busy) {
    return "Your camera or microphone is already in use. You can still join with them off.";
  }

  return "Couldn't start your camera or microphone. You can still join with them off.";
};

const PreviewFrame = ({
  onBack,
  children,
}: {
  onBack: () => void;
  children: ReactNode;
}) => (
  <div className="flex h-dvh flex-col overflow-hidden bg-base-100 text-base-content">
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-base-content/10 px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Zap className="size-5 text-primary" strokeWidth={2} aria-hidden="true" />
        <span className="text-lg font-semibold text-base-content">Yapply</span>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-base-content/80 transition-colors duration-150 hover:bg-base-content/5 hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        <span className="sm:hidden">Back</span>
        <span className="hidden sm:inline">Back to Live Rooms</span>
      </button>
    </header>
    <div className="flex min-h-0 flex-1 flex-col">{children}</div>
  </div>
);

const LiveRoomPreviewPage = () => {
  const { roomCode: rawRoomCode = "" } = useParams();
  const roomCode = normalizeRoomCode(rawRoomCode);
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [mediaMessage, setMediaMessage] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const mediaErrorShown = useRef(false);
  const backToRooms = () => navigate("/live-room");

  useEffect(() => {
    if (roomCode) clearRoomJoinIntent(roomCode);
  }, [roomCode]);

  const roomQuery = useQuery({
    queryKey: roomQueryKeys.detail(roomCode ?? "invalid"),
    queryFn: () => getLiveRoom(roomCode ?? ""),
    enabled: Boolean(roomCode),
    retry: false,
  });

  const onMediaError = useCallback((error: Error) => {
    const message = mediaErrorCopy(error);
    setMediaMessage(message);
    setCameraEnabled(false);
    setMicrophoneEnabled(false);
    if (mediaErrorShown.current) return;
    mediaErrorShown.current = true;
    toast.error(message);
  }, []);

  if (!roomCode) {
    return (
      <PreviewFrame onBack={backToRooms}>
        <RoomMessage
          title="Invalid room code"
          description="Enter a code like YAP-7K4P2Q or paste a meeting link."
          primaryLabel="Back to Live Rooms"
          onPrimary={backToRooms}
        />
      </PreviewFrame>
    );
  }

  if (rawRoomCode !== roomCode) {
    return <Navigate to={`/live-room/${roomCode}/preview`} replace />;
  }

  if (roomQuery.isLoading) {
    return (
      <PreviewFrame onBack={backToRooms}>
        <div className="flex flex-1 items-center justify-center">
          <LoaderIcon className="animate-spin text-primary" style={{ width: 48, height: 48 }} />
        </div>
      </PreviewFrame>
    );
  }

  if (roomQuery.isError) {
    const status = axios.isAxiosError(roomQuery.error) ? roomQuery.error.response?.status : undefined;
    const offline = axios.isAxiosError(roomQuery.error) && !roomQuery.error.response;

    if (status === 404) {
      return (
        <PreviewFrame onBack={backToRooms}>
          <RoomMessage
            title="Room not found"
            description="Check the room code and try again."
            primaryLabel="Back to Live Rooms"
            onPrimary={backToRooms}
          />
        </PreviewFrame>
      );
    }

    if (status === 401) {
      return (
        <PreviewFrame onBack={backToRooms}>
          <RoomMessage
            title="Please sign in again"
            description="Your session expired before this room could be opened."
            primaryLabel="Back to Live Rooms"
            onPrimary={backToRooms}
          />
        </PreviewFrame>
      );
    }

    return (
      <PreviewFrame onBack={backToRooms}>
        <RoomMessage
          title={offline ? "Can't reach Yapply" : "Couldn't load this room"}
          description={
            offline
              ? "The server is unavailable. Try again in a moment."
              : "Something went wrong while loading this room."
          }
          primaryLabel="Retry"
          onPrimary={() => void roomQuery.refetch()}
          secondaryLabel="Back to Live Rooms"
          onSecondary={backToRooms}
        />
      </PreviewFrame>
    );
  }

  const room = roomQuery.data;

  if (!room || room.status !== "active") {
    return (
      <PreviewFrame onBack={backToRooms}>
        <RoomMessage
          title="Room ended"
          description="This room is no longer available."
          primaryLabel="Back to Live Rooms"
          onPrimary={backToRooms}
        />
      </PreviewFrame>
    );
  }

  const shareUrl = roomShareUrl(room.roomCode);
  const displayName = authUser?.fullname || "Learner";
  const avatarUrl = authUser?.profileurl;

  const copyValue = async (value: string, success: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(success);
    } catch {
      toast.error("Couldn't copy. Select the text and copy it manually.");
    }
  };

  const clearMediaError = () => {
    setMediaMessage(null);
    mediaErrorShown.current = false;
  };

  const join = () => {
    if (isJoining) return;
    setIsJoining(true);

    window.setTimeout(() => {
      markRoomJoined(room.roomCode, {
        audio: microphoneEnabled,
        video: cameraEnabled,
      });
      navigate(`/live-room/${room.roomCode}`, {
        state: {
          confirmedJoin: true,
          audio: microphoneEnabled,
          video: cameraEnabled,
        },
      });
    }, 0);
  };

  return (
    <PreviewFrame onBack={backToRooms}>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <main className="flex items-center justify-center px-4 py-4 sm:px-6 lg:min-h-0 lg:flex-1 lg:px-8 lg:py-6">
          <LocalMediaPreview
            cameraEnabled={cameraEnabled}
            microphoneEnabled={microphoneEnabled}
            displayName={displayName}
            avatarUrl={avatarUrl}
            onMediaError={onMediaError}
          />
        </main>
        <LiveRoomPreviewPanel
          roomCode={room.roomCode}
          shareUrl={shareUrl}
          displayName={displayName}
          avatarUrl={avatarUrl}
          cameraEnabled={cameraEnabled}
          microphoneEnabled={microphoneEnabled}
          mediaMessage={mediaMessage}
          isJoining={isJoining}
          onCopyLink={() => void copyValue(shareUrl, "Room link copied")}
          onCopyCode={() => void copyValue(room.roomCode, "Room code copied")}
          onCameraChange={(enabled) => {
            clearMediaError();
            setCameraEnabled(enabled);
          }}
          onMicrophoneChange={(enabled) => {
            clearMediaError();
            setMicrophoneEnabled(enabled);
          }}
          onJoin={join}
        />
      </div>
    </PreviewFrame>
  );
};

export default LiveRoomPreviewPage;
