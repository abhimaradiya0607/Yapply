import { LiveKitRoom } from "@livekit/components-react";
import { MediaDeviceFailure } from "livekit-client";
import toast from "react-hot-toast";

import LiveConference from "./LiveConference";

type LiveRoomProps = {
  token: string;
  roomCode: string;
  audio: boolean;
  video: boolean;
  onLeaveStart: () => void;
  onLeave: () => void;
  onDisconnected: () => void;
};

const deviceLabel = (kind?: MediaDeviceKind) => {
  if (kind === "audioinput") return "Microphone";
  if (kind === "videoinput") return "Camera";
  return "Device";
};

const LiveRoom = ({
  token,
  roomCode,
  audio,
  video,
  onLeaveStart,
  onLeave,
  onDisconnected,
}: LiveRoomProps) => {
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL as string | undefined;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect
      audio={audio}
      video={video}
      onDisconnected={onDisconnected}
      onMediaDeviceFailure={(failure, kind) => {
        const device = deviceLabel(kind);

        if (failure === MediaDeviceFailure.PermissionDenied) {
          toast.error(`${device} unavailable. You can continue without it.`);
          return;
        }

        if (failure === MediaDeviceFailure.NotFound) {
          toast.error(`${device} unavailable.`);
          return;
        }

        if (failure === MediaDeviceFailure.DeviceInUse) {
          toast.error(`${device} unavailable. It is already in use.`);
          return;
        }

        toast.error(`${device} unavailable.`);
      }}
      className="h-full"
    >
      <LiveConference roomCode={roomCode} onLeaveStart={onLeaveStart} onLeave={onLeave} />
    </LiveKitRoom>
  );
};

export default LiveRoom;
