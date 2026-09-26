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
    <main className="min-h-screen bg-base-100 px-4 py-6 text-base-content sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-[-0.03em] text-base-content">
              Friends
              {!isLoading && !isError && (
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-sm font-bold text-primary-content">
                  {friends.length}
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm text-base-content/70">
              Your language partners
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
              className="h-12 w-full rounded-2xl border border-base-content/10 bg-base-200 px-4 text-sm text-base-content outline-none placeholder:text-base-content/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
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
            <div className="rounded-[24px] border border-base-content/10 bg-base-200 px-6 py-8">
              <h2 className="text-base font-semibold text-base-content">
                Couldn&apos;t load your friends
              </h2>
              <p className="mt-1 text-sm text-base-content/70">Try again in a moment.</p>
              <button
                type="button"
                onClick={() =>
                  void queryClient.invalidateQueries({ queryKey: ["friends"] })
                }
                className="mt-4 rounded-xl border border-base-content/10 px-4 py-2 text-sm font-semibold text-base-content transition hover:bg-base-content/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Retry
              </button>
            </div>
          ) : friends.length === 0 ? (
            <FriendsEmptyState />
          ) : visibleFriends.length === 0 ? (
            <p className="rounded-[28px] border border-dashed border-base-content/10 px-4 py-10 text-center text-sm text-base-content/70">
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
