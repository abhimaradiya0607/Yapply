import { useEffect, useMemo, useRef, useState } from "react";
import {
  isTrackReference,
  RoomAudioRenderer,
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
  VideoTrack,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import {
  ConnectionState,
  Track,
  type Participant,
} from "livekit-client";
import toast from "react-hot-toast";
import {
  Copy,
  Link2,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  MoreHorizontal,
  PhoneOff,
  RefreshCw,
  Users,
  Video,
  VideoOff,
  Wifi,
  WifiOff,
  Zap,
  type LucideIcon,
} from "lucide-react";

import MeetingChat from "../call/MeetingChat";
import { useMeetingChat } from "../call/useMeetingChat";
import { roomShareUrl } from "../../utils/roomCode";

type LiveConferenceProps = {
  roomCode: string;
  onLeaveStart: () => void;
  onLeave: () => void;
};

const participantName = (participant: Participant) =>
  participant.name?.trim() || "Learner";

const tileName = (participant: Participant) => {
  const name = participantName(participant);
  return participant.isLocal ? `${name} (You)` : name;
};

const gridClassName = (count: number) => {
  if (count <= 1) return "grid-cols-1 w-[min(100%,960px)]";
  if (count === 2) return "grid-cols-2 w-full max-w-6xl";
  if (count <= 4) return "grid-cols-2 w-full max-w-6xl";
  if (count <= 6) return "grid-cols-2 w-full md:grid-cols-3";
  return "grid-cols-2 w-full md:grid-cols-3 xl:grid-cols-4";
};

const connectionPresentation = (
  state: ConnectionState,
): { label: string; icon: LucideIcon } => {
  if (state === ConnectionState.Connected) return { label: "Connected", icon: Wifi };
  if (state === ConnectionState.Connecting) return { label: "Connecting", icon: Loader2 };
  if (
    state === ConnectionState.Reconnecting ||
    state === ConnectionState.SignalReconnecting
  ) {
    return { label: "Reconnecting", icon: RefreshCw };
  }
  return { label: "Disconnected", icon: WifiOff };
};

const mediaErrorMessage = (error: unknown, device: "Camera" | "Microphone") => {
  const name = error instanceof Error ? error.name : "";

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return `${device} unavailable. You can continue without it.`;
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return `${device} unavailable.`;
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return `${device} unavailable. It is already in use.`;
  }

  return `${device} unavailable.`;
};

const controlClass = (active: boolean, muted = false) =>
  [
    "inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    "disabled:cursor-not-allowed disabled:opacity-60",
    muted
      ? "bg-error/15 text-error hover:bg-error/20"
      : active
        ? "bg-base-300 text-primary hover:bg-base-300/80"
        : "bg-base-100 text-base-content hover:bg-base-300",
  ].join(" ");

const ParticipantTile = ({ track }: { track: TrackReferenceOrPlaceholder }) => {
  const speaking = useIsSpeaking(track.participant);
  const isScreenShare = track.source === Track.Source.ScreenShare;
  const hasVideo =
    isTrackReference(track) && (isScreenShare || track.participant.isCameraEnabled);
  const name = tileName(track.participant);
  const micOn = track.participant.isMicrophoneEnabled;
  const cameraOn = isScreenShare || track.participant.isCameraEnabled;

  return (
    <article
      className={[
        "relative aspect-video overflow-hidden rounded-xl border-2 bg-black",
        speaking ? "border-primary" : "border-base-content/10",
      ].join(" ")}
    >
      {hasVideo ? (
        <VideoTrack
          trackRef={track}
          className={[
            "h-full w-full bg-black",
            isScreenShare ? "object-contain" : "object-cover",
            track.participant.isLocal && !isScreenShare ? "scale-x-[-1]" : "",
          ].join(" ")}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-black">
          <div className="flex size-16 items-center justify-center rounded-full bg-base-300 text-lg font-semibold text-base-content">
            {participantName(track.participant).slice(0, 1).toUpperCase()}
          </div>
        </div>
      )}

      {(speaking || isScreenShare) && (
        <div className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white">
          {isScreenShare ? "Screen" : "Speaking"}
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-2 rounded-lg bg-black/70 px-2 py-1 text-xs text-white">
        <span className="truncate font-medium">{name}</span>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-white/90">
          {micOn ? (
            <Mic className="size-3.5" aria-label="Microphone on" />
          ) : (
            <MicOff className="size-3.5" aria-label="Microphone off" />
          )}
          {!isScreenShare &&
            (cameraOn ? (
              <Video className="size-3.5" aria-label="Camera on" />
            ) : (
              <VideoOff className="size-3.5" aria-label="Camera off" />
            ))}
        </span>
      </div>
    </article>
  );
};

const LiveConference = ({ roomCode, onLeaveStart, onLeave }: LiveConferenceProps) => {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const {
    localParticipant,
    isCameraEnabled,
    isMicrophoneEnabled,
    isScreenShareEnabled,
    lastCameraError,
    lastMicrophoneError,
  } = useLocalParticipant();
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const chat = useMeetingChat(roomCode);
  const [mediaBusy, setMediaBusy] = useState<"audio" | "video" | "screen" | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const visibleTracks = useMemo(
    () =>
      [...tracks].sort((left, right) => {
        const weight = (track: TrackReferenceOrPlaceholder) => {
          if (track.source === Track.Source.ScreenShare) return 0;
          if (!track.participant.isLocal) return 1;
          return 2;
        };

        return weight(left) - weight(right);
      }),
    [tracks],
  );

  useEffect(() => {
    if (!moreOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  const toggleMicrophone = async () => {
    setMediaBusy("audio");
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (error) {
      toast.error(mediaErrorMessage(error, "Microphone"));
    } finally {
      setMediaBusy(null);
    }
  };

  const toggleCamera = async () => {
    setMediaBusy("video");
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (error) {
      toast.error(mediaErrorMessage(error, "Camera"));
    } finally {
      setMediaBusy(null);
    }
  };

  const toggleScreenShare = async () => {
    setMediaBusy("screen");
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
    } catch (error) {
      const name = error instanceof Error ? error.name : "";
      toast.error(
        name === "NotAllowedError"
          ? "Screen sharing was cancelled."
          : "Screen sharing isn't available right now.",
      );
    } finally {
      setMediaBusy(null);
    }
  };

  const leaveRoom = async () => {
    onLeaveStart();
    try {
      await room.disconnect(true);
    } finally {
      onLeave();
    }
  };

  const copyValue = async (value: string, success: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(success);
    } catch {
      toast.error("Couldn't copy. Select the text and copy it manually.");
    } finally {
      setMoreOpen(false);
    }
  };

  const status = connectionPresentation(connectionState);
  const StatusIcon = status.icon;
  const statusSpin = connectionState === ConnectionState.Connecting;
  const reconnecting =
    connectionState === ConnectionState.Reconnecting ||
    connectionState === ConnectionState.SignalReconnecting;
  const participantCount = participants.length;
  const deviceNotice = lastCameraError
    ? "Camera unavailable"
    : lastMicrophoneError
      ? "Microphone unavailable"
      : null;

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-base-100 text-base-content">
      <RoomAudioRenderer />

      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-base-content/10 px-3 sm:px-5">
        <div className="flex shrink-0 items-center gap-2">
          <Zap className="size-5 text-primary" strokeWidth={2} aria-hidden="true" />
          <span className="text-base font-semibold">Yapply</span>
        </div>

        <p className="min-w-0 flex-1 truncate text-sm font-semibold tracking-[0.06em]">
          {roomCode}
        </p>

        <div className="flex shrink-0 items-center gap-3 text-xs text-base-content/80 sm:gap-4 sm:text-sm">
          <span className="inline-flex items-center gap-1.5" aria-live="polite">
            <StatusIcon
              className={["size-3.5 shrink-0", statusSpin ? "animate-spin" : ""].join(" ")}
              aria-hidden="true"
            />
            {status.label}
          </span>
          <span aria-label={`${participantCount} participants`}>
            <span className="sm:hidden">{participantCount}</span>
            <span className="hidden sm:inline">
              {participantCount} {participantCount === 1 ? "participant" : "participants"}
            </span>
          </span>
        </div>
      </header>

      {deviceNotice && (
        <p className="shrink-0 border-b border-base-content/10 px-4 py-2 text-center text-sm text-base-content/80">
          {deviceNotice}. You can continue without it.
        </p>
      )}

      <div className="relative flex min-h-0 flex-1">
      <div className="relative min-h-0 flex-1">
        <main className="h-full overflow-auto">
          <div className="flex min-h-full items-center justify-center px-3 pb-28 pt-4 sm:px-5">
            {connectionState === ConnectionState.Connecting && visibleTracks.length === 0 ? (
              <div className="w-full max-w-md rounded-3xl border border-base-content/10 bg-base-200 px-6 py-8 text-center">
                <Loader2 className="mx-auto size-5 animate-spin text-primary" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-semibold">Connecting to room...</h2>
                <p className="mt-1 text-sm text-base-content/70">
                  Setting up your place in {roomCode}.
                </p>
              </div>
            ) : connectionState === ConnectionState.Disconnected && visibleTracks.length === 0 ? (
              <div className="w-full max-w-md rounded-3xl border border-base-content/10 bg-base-200 px-6 py-8 text-center">
                <WifiOff className="mx-auto size-5 text-base-content/70" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-semibold">Disconnected</h2>
                <p className="mt-1 text-sm text-base-content/70">
                  The connection to this room was lost.
                </p>
              </div>
            ) : (
              <div className={`grid gap-3 ${gridClassName(visibleTracks.length)}`}>
                {visibleTracks.map((track) => (
                  <ParticipantTile
                    key={`${track.participant.identity}-${track.source}`}
                    track={track}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {reconnecting && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-200 px-3 py-1.5 text-sm text-base-content">
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Reconnecting...
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-base-content/10 bg-base-200 p-2">
          <button
            type="button"
            onClick={() => void toggleMicrophone()}
            disabled={mediaBusy === "audio"}
            aria-pressed={isMicrophoneEnabled}
            aria-label={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
            className={controlClass(isMicrophoneEnabled, !isMicrophoneEnabled)}
          >
            {isMicrophoneEnabled ? (
              <Mic className="size-5" aria-hidden="true" />
            ) : (
              <MicOff className="size-5" aria-hidden="true" />
            )}
            <span className="hidden md:inline">{isMicrophoneEnabled ? "Mute" : "Unmute"}</span>
          </button>

          <button
            type="button"
            onClick={() => void toggleCamera()}
            disabled={mediaBusy === "video"}
            aria-pressed={isCameraEnabled}
            aria-label={isCameraEnabled ? "Turn camera off" : "Turn camera on"}
            className={controlClass(isCameraEnabled, !isCameraEnabled)}
          >
            {isCameraEnabled ? (
              <Video className="size-5" aria-hidden="true" />
            ) : (
              <VideoOff className="size-5" aria-hidden="true" />
            )}
            <span className="hidden md:inline">{isCameraEnabled ? "Camera" : "Start video"}</span>
          </button>

          <button
            type="button"
            onClick={() => void toggleScreenShare()}
            disabled={mediaBusy === "screen"}
            aria-pressed={isScreenShareEnabled}
            aria-label={isScreenShareEnabled ? "Stop screen share" : "Share screen"}
            className={controlClass(isScreenShareEnabled)}
          >
            <MonitorUp className="size-5" aria-hidden="true" />
            <span className="hidden md:inline">{isScreenShareEnabled ? "Stop share" : "Share"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              setChatOpen(false);
              setParticipantsOpen((open) => !open);
            }}
            aria-pressed={participantsOpen}
            aria-label="Participants"
            className={controlClass(participantsOpen)}
          >
            <Users className="size-5" aria-hidden="true" />
            <span className="hidden md:inline">Participants</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              setParticipantsOpen(false);
              setChatOpen((open) => !open);
            }}
            aria-pressed={chatOpen}
            aria-label={chatOpen ? "Close chat" : "Open chat"}
            className={controlClass(chatOpen)}
          >
            <MessageSquare className="size-5" aria-hidden="true" />
            <span className="hidden md:inline">Chat</span>
          </button>

          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              aria-label="More"
              className={controlClass(moreOpen)}
            >
              <MoreHorizontal className="size-5" aria-hidden="true" />
              <span className="hidden md:inline">More</span>
            </button>
            {moreOpen && (
              <div
                role="menu"
                className="absolute bottom-14 right-0 z-50 w-44 rounded-xl border border-base-content/10 bg-base-100 p-1"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void copyValue(roomCode, "Room code copied")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-base-content/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Copy className="size-4" aria-hidden="true" />
                  Copy code
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void copyValue(roomShareUrl(roomCode), "Room link copied")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-base-content/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Link2 className="size-4" aria-hidden="true" />
                  Copy link
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => void leaveRoom()}
            aria-label="Leave room"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-error px-4 text-sm font-semibold text-error-content transition-colors duration-150 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
          >
            <PhoneOff className="size-5" aria-hidden="true" />
            Leave
          </button>
        </div>
        </div>
      </div>

      {chatOpen && (
        <MeetingChat
          className="absolute inset-x-0 top-0 bottom-28 z-30 flex min-h-0 flex-col border-base-content/10 bg-base-100 md:static md:inset-auto md:z-auto md:h-full md:w-[320px] md:shrink-0 md:border-l"
          messages={chat.messages}
          currentUserId={localParticipant.identity}
          connected={chat.connected}
          error={chat.error}
          onSend={chat.sendMessage}
          onClose={() => setChatOpen(false)}
        />
      )}
      </div>

      {participantsOpen && (
        <div className="absolute inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close participants"
            className="absolute inset-0 bg-black/50 lg:bg-black/20"
            onClick={() => setParticipantsOpen(false)}
          />
          <aside className="relative flex h-full w-[min(100%,22rem)] flex-col border-l border-base-content/10 bg-base-100">
            <div className="flex items-start justify-between gap-3 border-b border-base-content/10 px-4 py-4">
              <div>
                <h2 className="text-base font-semibold">Participants</h2>
                <p className="mt-0.5 text-sm text-base-content/70">{participantCount}</p>
              </div>
              <button
                type="button"
                onClick={() => setParticipantsOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-medium text-base-content/70 transition-colors hover:bg-base-content/5 hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Close
              </button>
            </div>
            <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {participants.map((participant) => (
                <li
                  key={participant.identity}
                  className="rounded-xl border border-base-content/10 bg-base-200 px-3 py-2.5"
                >
                  <p className="truncate text-sm font-semibold">{participantName(participant)}</p>
                  <p className="mt-0.5 text-xs text-base-content/70">
                    {participant.isLocal
                      ? "You"
                      : participant.isMicrophoneEnabled
                        ? "Mic on"
                        : "Mic off"}
                  </p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
};

export default LiveConference;
