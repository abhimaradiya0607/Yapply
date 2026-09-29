import { Copy, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { LoaderIcon } from "react-hot-toast";

import Avatar from "../Avatar";

type LiveRoomPreviewPanelProps = {
  roomCode: string;
  shareUrl: string;
  displayName: string;
  avatarUrl?: string | null;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  mediaMessage: string | null;
  isJoining: boolean;
  onCopyLink: () => void;
  onCopyCode: () => void;
  onCameraChange: (enabled: boolean) => void;
  onMicrophoneChange: (enabled: boolean) => void;
  onJoin: () => void;
};

const deviceButtonClass = (enabled: boolean) =>
  [
    "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200",
    "disabled:cursor-not-allowed disabled:opacity-60",
    enabled
      ? "border-base-content/10 bg-base-100 hover:bg-base-100/70 active:bg-base-300"
      : "border-error/25 bg-error/10 hover:bg-error/15 active:bg-error/20",
  ].join(" ");

const LiveRoomPreviewPanel = ({
  roomCode,
  shareUrl,
  displayName,
  avatarUrl,
  cameraEnabled,
  microphoneEnabled,
  mediaMessage,
  isJoining,
  onCopyLink,
  onCopyCode,
  onCameraChange,
  onMicrophoneChange,
  onJoin,
}: LiveRoomPreviewPanelProps) => (
  <aside className="flex w-full shrink-0 flex-col border-t border-base-content/10 bg-base-200 lg:h-full lg:w-[360px] lg:border-l lg:border-t-0">
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
      <div>
        <p className="text-sm font-medium text-base-content/60">Live Room</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[0.06em] text-base-content">
          {roomCode}
        </h1>
        <p className="mt-2 text-sm text-base-content/70">Check your setup before joining.</p>
      </div>

      <section className="rounded-2xl border border-base-content/10 bg-base-100 p-4">
        <h2 className="text-sm font-semibold text-base-content">Share this room</h2>
        <p className="mt-3 text-sm font-semibold tracking-[0.08em] text-base-content">
          {roomCode}
        </p>
        <p className="mt-1 truncate text-xs text-base-content/60" title={shareUrl}>
          {shareUrl}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onCopyLink}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-base-content/10 bg-base-200 text-sm font-semibold text-base-content transition-colors duration-150 hover:bg-base-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:bg-base-300"
          >
            <Copy className="size-4" aria-hidden="true" />
            Copy link
          </button>
          <button
            type="button"
            onClick={onCopyCode}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-base-content/10 bg-base-200 text-sm font-semibold text-base-content transition-colors duration-150 hover:bg-base-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:bg-base-300"
          >
            <Copy className="size-4" aria-hidden="true" />
            Copy code
          </button>
        </div>
      </section>

      <div className="space-y-2">
        <button
          type="button"
          aria-pressed={microphoneEnabled}
          aria-label={microphoneEnabled ? "Turn microphone off" : "Turn microphone on"}
          disabled={isJoining}
          onClick={() => onMicrophoneChange(!microphoneEnabled)}
          className={deviceButtonClass(microphoneEnabled)}
        >
          <span
            className={[
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              microphoneEnabled ? "bg-base-200 text-primary" : "bg-error/15 text-error",
            ].join(" ")}
          >
            {microphoneEnabled ? (
              <Mic className="size-4" aria-hidden="true" />
            ) : (
              <MicOff className="size-4" aria-hidden="true" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-base-content">Microphone</span>
            <span className="block text-xs text-base-content/70">
              {microphoneEnabled ? "On" : "Off"}
            </span>
          </span>
        </button>

        <button
          type="button"
          aria-pressed={cameraEnabled}
          aria-label={cameraEnabled ? "Turn camera off" : "Turn camera on"}
          disabled={isJoining}
          onClick={() => onCameraChange(!cameraEnabled)}
          className={deviceButtonClass(cameraEnabled)}
        >
          <span
            className={[
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              cameraEnabled ? "bg-base-200 text-primary" : "bg-error/15 text-error",
            ].join(" ")}
          >
            {cameraEnabled ? (
              <Video className="size-4" aria-hidden="true" />
            ) : (
              <VideoOff className="size-4" aria-hidden="true" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-base-content">Camera</span>
            <span className="block text-xs text-base-content/70">
              {cameraEnabled ? "On" : "Off"}
            </span>
          </span>
        </button>
      </div>

      {mediaMessage && (
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-base-content">
          {mediaMessage}
        </p>
      )}

      <div>
        <p className="text-xs font-medium text-base-content/60">You are joining as</p>
        <div className="mt-2 flex items-center gap-3">
          <Avatar name={displayName} src={avatarUrl} size="size-10" alt="" />
          <p className="truncate text-sm font-semibold text-base-content">{displayName}</p>
        </div>
      </div>
    </div>

    <div className="shrink-0 border-t border-base-content/10 px-5 py-4">
      <button
        type="button"
        onClick={onJoin}
        disabled={isJoining}
        aria-busy={isJoining}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-content transition-colors duration-150 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isJoining ? (
          <>
            <LoaderIcon className="animate-spin" style={{ width: 16, height: 16 }} />
            Joining...
          </>
        ) : (
          "Join room"
        )}
      </button>
    </div>
  </aside>
);

export default LiveRoomPreviewPanel;
