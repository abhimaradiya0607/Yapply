import { useEffect, useMemo, useRef } from "react";
import { usePreviewTracks } from "@livekit/components-react";
import { LoaderIcon } from "react-hot-toast";
import { Video, VideoOff } from "lucide-react";

import Avatar from "../Avatar";

type LocalMediaPreviewProps = {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  displayName: string;
  avatarUrl?: string | null;
  onMediaError: (error: Error) => void;
};

const LocalMediaPreview = ({
  cameraEnabled,
  microphoneEnabled,
  displayName,
  avatarUrl,
  onMediaError,
}: LocalMediaPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackOptions = useMemo(
    () => ({
      audio: microphoneEnabled,
      video: cameraEnabled,
    }),
    [cameraEnabled, microphoneEnabled],
  );

  const tracks = usePreviewTracks(trackOptions, onMediaError);
  const videoTrack = tracks?.find((track) => track.kind === "video");

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !videoTrack) return;

    videoTrack.attach(element);

    return () => {
      videoTrack.detach(element);
    };
  }, [videoTrack]);

  const startingCamera = cameraEnabled && !videoTrack;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-base-content/10 bg-black lg:max-w-[min(100%,calc((100dvh-6.5rem)*16/9))]">
      {videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full scale-x-[-1] bg-black object-cover"
        />
      ) : startingCamera ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-black text-white">
          <LoaderIcon
            className="animate-spin text-primary"
            style={{ width: 28, height: 28 }}
          />
          <p className="text-sm text-white/75">Starting camera...</p>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-black px-6 text-center">
          <Avatar
            name={displayName}
            src={avatarUrl}
            size="size-24"
            textSize="text-2xl"
            alt=""
          />
          <p className="text-sm font-medium text-white/80">Camera is off</p>
        </div>
      )}

      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
        Preview
      </div>

      <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
        {cameraEnabled ? (
          <Video className="size-3.5" aria-hidden="true" />
        ) : (
          <VideoOff className="size-3.5" aria-hidden="true" />
        )}
        {cameraEnabled ? "Camera on" : "Camera off"}
      </div>

      {cameraEnabled && (
        <div className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-black/60 py-1 pl-1 pr-3">
          <Avatar name={displayName} src={avatarUrl} size="size-8" alt="" />
          <span className="truncate text-sm font-medium text-white">{displayName}</span>
        </div>
      )}
    </div>
  );
};

export default LocalMediaPreview;
