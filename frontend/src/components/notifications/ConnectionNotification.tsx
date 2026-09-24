import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { AcceptedFriendRequest } from "../../lib/api";
import Avatar from "../Avatar";

const formatRelativeTime = (value?: string | null) => {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return minutes === 1 ? "1 min ago" : `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString();
};

const ConnectionNotification = ({
  connection,
}: {
  connection: AcceptedFriendRequest;
}) => {
  const navigate = useNavigate();
  const friend = connection.friend;
  const name = friend.fullname?.trim() || "Learner";

  return (
    <article className="flex flex-col gap-4 rounded-[24px] border border-white/[0.06] bg-[#1a1b1e] p-5 transition-colors duration-200 hover:border-white/10 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={name} src={friend.profileurl} alt={name} size="size-11" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[#f5f5f5]">
            {name}
          </h3>
          <p className="mt-0.5 text-sm text-[#b8bac2]">You are now connected.</p>
          <p className="mt-1 text-xs text-[#9a9ca6]">
            {formatRelativeTime(connection.createdAt)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/chat/${friend.id}`)}
        aria-label={`Message ${name}`}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#222328] px-4 py-2.5 text-sm font-semibold text-[#f5f5f5] transition hover:bg-[#2a2b31] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c7ff20] sm:shrink-0"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        Message
      </button>
    </article>
  );
};

export default ConnectionNotification;
