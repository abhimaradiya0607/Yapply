import { Link } from "react-router-dom";

import type { Learner } from "../../lib/api";
import FriendCard from "./FriendCard";
import FriendCardSkeleton from "./FriendCardSkeleton";
import FriendsEmptyState from "./FriendsEmptyState";

const PREVIEW_LIMIT = 4;

const FriendsSection = ({
  friends,
  isLoading,
  isError,
  onRetry,
  onFindPartners,
}: {
  friends: Learner[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onFindPartners: () => void;
}) => {
  const previewFriends = friends.slice(0, PREVIEW_LIMIT);

  return (
    <section className="mt-6" aria-labelledby="friends-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id="friends-heading"
            className="text-xl font-semibold text-[#f5f5f5]"
          >
            Friends
            {!isLoading && !isError && (
              <span className="ml-2 text-sm font-medium text-[#b8bac2]">
                · {friends.length}
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-[#9a9ca6]">Your language partners</p>
        </div>

        {friends.length > PREVIEW_LIMIT && (
          <Link
            to="/friends"
            className="shrink-0 text-sm font-semibold text-[#c7ff20] transition hover:text-[#d3ff4d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c7ff20]"
          >
            View all →
          </Link>
        )}
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: PREVIEW_LIMIT }, (_, index) => (
              <FriendCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-[24px] border border-white/[0.06] bg-[#1a1b1e] px-6 py-8">
            <h3 className="text-base font-semibold text-[#f5f5f5]">
              Couldn&apos;t load your friends
            </h3>
            <p className="mt-1 text-sm text-[#b8bac2]">Try again in a moment.</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 rounded-xl border border-white/10 bg-[#222328] px-4 py-2 text-sm font-semibold text-[#f5f5f5] transition hover:bg-[#2a2b31] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c7ff20]"
            >
              Retry
            </button>
          </div>
        ) : friends.length === 0 ? (
          <FriendsEmptyState onFindPartners={onFindPartners} />
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {previewFriends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FriendsSection;
