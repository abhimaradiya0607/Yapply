import { MapPin, UserPlus } from "lucide-react";

import type { Learner } from "../../lib/api";
import Avatar from "../Avatar";
import LanguageBadge from "../friends/LanguageBadge";

const DiscoverCard = ({
  user,
  requested,
  sending,
  onSendRequest,
}: {
  user: Learner;
  requested: boolean;
  sending: boolean;
  onSendRequest: () => void;
}) => {
  const name = user.fullname?.trim() || "Learner";
  const location = user.location?.trim();
  const bio = user.bio?.trim();
  const busy = requested || sending;

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-white/[0.06] bg-[#1a1b1e] p-5 transition-colors duration-200 hover:border-white/10 hover:bg-[#1c1d20]">
      <div className="flex items-center gap-3">
        <Avatar name={name} src={user.profileurl} alt={name} size="size-14" />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold tracking-tight text-[#f5f5f5]">
            {name}
          </h3>
          {location && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#b8bac2]">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{location}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <LanguageBadge kind="native" language={user.nativelanguage} />
        <LanguageBadge kind="learning" language={user.learninglanguage} />
      </div>

      {bio && (
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-[#9a9ca6]">
          {bio}
        </p>
      )}

      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={onSendRequest}
          disabled={busy}
          aria-label={
            requested
              ? `Friend request sent to ${name}`
              : `Send friend request to ${name}`
          }
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c7ff20] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1b1e] disabled:cursor-not-allowed ${
            busy
              ? "border border-white/10 bg-[#222328] text-[#b8bac2]"
              : "bg-[#c7ff20] text-[#111214] hover:bg-[#d3ff4d]"
          }`}
        >
          {!busy && <UserPlus className="size-4" aria-hidden="true" />}
          {requested ? "Requested" : sending ? "Sending..." : "Send Friend Request"}
        </button>
      </div>
    </article>
  );
};

export default DiscoverCard;
