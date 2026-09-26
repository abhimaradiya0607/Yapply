import { Check, MapPin, X } from "lucide-react";

import LanguageBadge from "../friends/LanguageBadge";
import type { IncomingFriendRequest } from "../../lib/api";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import Avatar from "../Avatar";

const FriendRequestNotification = ({
  request,
  isAccepting,
  isDeclining,
  isUnread = false,
  onAccept,
  onDecline,
}: {
  request: IncomingFriendRequest;
  isAccepting: boolean;
  isDeclining: boolean;
  isUnread?: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) => {
  const sender = request.sender;
  const name = sender.fullname?.trim() || "Learner";
  const location = sender.location?.trim();
  const bio = sender.bio?.trim();
  const busy = isAccepting || isDeclining;

  return (
    <article
      className={`flex flex-col gap-4 rounded-[24px] border p-5 transition-colors duration-200 sm:flex-row sm:items-center ${
        isUnread
          ? "border-primary/30 bg-base-300"
          : "border-base-content/10 bg-base-200 hover:border-base-content/20 hover:bg-base-300"
      }`}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        <Avatar name={name} src={sender.profileurl} alt={name} />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold tracking-tight text-base-content">
            {name} sent you a friend request.
          </h3>
          <p className="mt-1 text-xs text-base-content/60">
            {formatRelativeTime(request.createdAt)}
          </p>
          {location && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-base-content/70">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{location}</span>
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <LanguageBadge kind="native" language={sender.nativeLanguage} />
            <LanguageBadge kind="learning" language={sender.learningLanguage} />
          </div>
          {bio && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-base-content/60">
              {bio}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onDecline}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-base-content/10 px-4 py-2.5 text-sm font-semibold text-base-content transition hover:bg-base-content/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          {!isDeclining && <X className="size-4" aria-hidden="true" />}
          {isDeclining ? "Declining..." : "Decline"}
        </button>
        <button
          type="button"
          onClick={onAccept}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-content transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-200 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          {!isAccepting && <Check className="size-4" aria-hidden="true" />}
          {isAccepting ? "Accepting..." : "Accept"}
        </button>
      </div>
    </article>
  );
};

export default FriendRequestNotification;
