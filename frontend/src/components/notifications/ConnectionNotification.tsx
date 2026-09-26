import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { AcceptedFriendRequest } from "../../lib/api";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import Avatar from "../Avatar";

const ConnectionNotification = ({
  connection,
  isUnread = false,
  onOpen,
}: {
  connection: AcceptedFriendRequest;
  isUnread?: boolean;
  onOpen?: () => void;
}) => {
  const navigate = useNavigate();
  const friend = connection.friend;
  const name = friend.fullname?.trim() || "Learner";

  return (
    <article
      className={`flex flex-col gap-4 rounded-[24px] border p-5 transition-colors duration-200 sm:flex-row sm:items-center ${
        isUnread
          ? "border-primary/30 bg-base-300"
          : "border-base-content/10 bg-base-200 hover:border-base-content/20"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={name} src={friend.profileurl} alt={name} size="size-11" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-base-content">
            {name} accepted your friend request.
          </h3>
          <p className="mt-1 text-xs text-base-content/60">
            {formatRelativeTime(connection.createdAt)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          onOpen?.();
          navigate(`/chat/${friend.id}`);
        }}
        aria-label={`Message ${name}`}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-base-content/10 bg-base-300 px-4 py-2.5 text-sm font-semibold text-base-content transition hover:bg-base-content/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:shrink-0"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        Message
      </button>
    </article>
  );
};

export default ConnectionNotification;
