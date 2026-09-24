import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import FriendCard from "../components/friends/FriendCard";
import FriendCardSkeleton from "../components/friends/FriendCardSkeleton";
import FriendsEmptyState from "../components/friends/FriendsEmptyState";
import { getUserFriends } from "../lib/api";

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const {
    data: friends = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const visibleFriends = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return friends;

    return friends.filter((friend) =>
      [friend.fullname, friend.nativelanguage, friend.learninglanguage, friend.location]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [friends, search]);

  return (
    <main className="min-h-screen bg-[#111214] px-4 py-6 text-[#f5f5f5] sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#f5f5f5]">
              Friends
            </h1>
            <p className="mt-1 text-sm text-[#b8bac2]">
              Your language partners
              {!isLoading && !isError && (
                <span>
                  {" "}
                  · {friends.length} {friends.length === 1 ? "friend" : "friends"}
                </span>
              )}
            </p>
          </div>
        </div>

        {!isLoading && !isError && friends.length > 0 && (
          <label className="mt-6 block">
            <span className="sr-only">Search friends</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search friends..."
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#1a1b1e] px-4 text-sm text-[#f5f5f5] outline-none placeholder:text-[#9a9ca6] focus:border-[#c7ff20]/40 focus:ring-2 focus:ring-[#c7ff20]/10"
            />
          </label>
        )}

        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <FriendCardSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-[24px] border border-white/[0.06] bg-[#1a1b1e] px-6 py-8">
              <h2 className="text-base font-semibold text-[#f5f5f5]">
                Couldn&apos;t load your friends
              </h2>
              <p className="mt-1 text-sm text-[#b8bac2]">Try again in a moment.</p>
              <button
                type="button"
                onClick={() =>
                  void queryClient.invalidateQueries({ queryKey: ["friends"] })
                }
                className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-[#f5f5f5] transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c7ff20]"
              >
                Retry
              </button>
            </div>
          ) : friends.length === 0 ? (
            <FriendsEmptyState />
          ) : visibleFriends.length === 0 ? (
            <p className="rounded-[28px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-[#b8bac2]">
              No friends match that search.
            </p>
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleFriends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default FriendsPage;
