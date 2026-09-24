import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Avatar from "../components/Avatar";
import DiscoverCard from "../components/discover/DiscoverCard";
import FriendCardSkeleton from "../components/friends/FriendCardSkeleton";
import FriendsSection from "../components/friends/FriendsSection";
import useAuthUser from "../hooks/useAuthUser";
import {
  acceptFriendRequest,
  getFriendRequests,
  getOutgoingFriendRequests,
  getRecommendedUsers,
  getUserFriends,
  rejectFriendRequest,
  sendFriendRequest,
  type IncomingFriendRequest,
} from "../lib/api";

const RequestRow = ({
  request,
  busy,
  onAccept,
  onDecline,
}: {
  request: IncomingFriendRequest;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) => {
  const sender = request.sender;
  const nativeLanguage = sender.nativeLanguage?.trim();
  const learningLanguage = sender.learningLanguage?.trim();
  const location = sender.location?.trim();
  const bio = sender.bio?.trim();

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-[#111214] p-4 sm:flex-row sm:items-center">
      <Avatar name={sender.fullname} src={sender.profileurl} />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-[#f5f5f5]">
          {sender.fullname || "Learner"}
        </h3>
        {location && (
          <p className="mt-1 truncate text-sm text-[#b8bac2]">{location}</p>
        )}
        {(nativeLanguage || learningLanguage) && (
          <p className="mt-1 text-sm text-[#b8bac2]">
            {nativeLanguage && <span>Native: {nativeLanguage}</span>}
            {nativeLanguage && learningLanguage && <span> · </span>}
            {learningLanguage && <span>Learning: {learningLanguage}</span>}
          </p>
        )}
        {bio && <p className="mt-2 line-clamp-2 text-sm text-[#9a9ca6]">{bio}</p>}
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onAccept}
          disabled={busy}
          className="rounded-xl bg-[#c7ff20] px-4 py-2 text-sm font-bold text-[#111214] transition hover:bg-[#d3ff4d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={onDecline}
          disabled={busy}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-[#f5f5f5] transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    </article>
  );
};

const HomePage = () => {
  const { authUser, isLoading } = useAuthUser();
  const queryClient = useQueryClient();
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const {
    data: friends = [],
    isLoading: loadingFriends,
    isError: friendsError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendRequests = [], isLoading: loadingOutgoing } =
    useQuery({
      queryKey: ["outgoingFriendRequests"],
      queryFn: getOutgoingFriendRequests,
    });

  const { data: friendRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const refreshFriendData = () => {
    void queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    void queryClient.invalidateQueries({ queryKey: ["friends"] });
    void queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
    void queryClient.invalidateQueries({ queryKey: ["outgoingFriendRequests"] });
  };

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: refreshFriendData,
  });

  const declineMutation = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: refreshFriendData,
  });

  const sendMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: refreshFriendData,
  });

  const incomingRequests = friendRequests?.incomingRequest ?? [];
  const previewRequests = incomingRequests.slice(0, 2);

  const friendIds = new Set(friends.map((friend) => friend.id));
  const incomingSenderIds = new Set(
    incomingRequests.map((request) => request.sender.id),
  );
  const outgoingRecipientIds = new Set(
    outgoingFriendRequests.map((request) => request.recipient.id),
  );

  const discoverUsers = recommendedUsers.filter(
    (user) =>
      user.id !== authUser?.id &&
      !friendIds.has(user.id) &&
      !incomingSenderIds.has(user.id),
  );

  const isRequestBusy = (requestId: string) =>
    (acceptMutation.isPending && acceptMutation.variables === requestId) ||
    (declineMutation.isPending && declineMutation.variables === requestId);

  useEffect(() => {
    if (window.location.hash !== "#discover-learners") return;

    document.getElementById("discover-learners")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  useEffect(() => {
    if (!isRequestsOpen) return;

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsRequestsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isRequestsOpen]);

  const fullName = authUser?.fullname || "there";
  const firstName = fullName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <main className="min-h-screen bg-[#111214] px-4 py-6 text-[#f5f5f5] sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-7xl">
        <div className="rounded-[28px] border border-white/[0.03] bg-[#1a1b1e] px-6 py-8 shadow-sm sm:px-10 sm:py-10 lg:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-[#222328] px-4 py-2 text-sm font-medium text-[#f4f4f5] sm:text-base">
                <span className="h-3 w-3 rounded-full bg-[#c7ff20]" />
                Daily Command Center
              </div>

              <h1 className="text-4xl font-medium leading-[1.05] tracking-[-0.04em] text-[#f5f5f5] sm:text-5xl lg:text-6xl">
                {greeting},{" "}
                <span className="font-semibold">
                  {isLoading ? "..." : `${firstName}.`}
                </span>
                <br />
                <span className="font-semibold text-[#c7ff20]">
                  Ready for today&apos;s exchange?
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#b8bac2] sm:text-xl">
                You have{" "}
                <span className="font-semibold text-[#f5f5f5]">
                  2 incoming partner invites
                </span>{" "}
                and{" "}
                <span className="font-semibold text-[#f5f5f5]">
                  48 native Spanish speakers
                </span>{" "}
                active right now.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-5 lg:items-end">
              <div className="inline-flex w-fit items-center gap-3 rounded-2xl bg-[#232429] px-5 py-4 text-lg font-medium text-[#f5f5f5]">
                <span className="text-2xl">🔥</span>
                14-day streak
              </div>

              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#c7ff20] px-6 py-5 text-lg font-bold text-[#111214] transition hover:bg-[#d3ff4d] focus:outline-none focus:ring-2 focus:ring-[#c7ff20] focus:ring-offset-2 focus:ring-offset-[#1a1b1e] sm:w-auto"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="m9.5 14.5 1.5-5 4.5-1.5-1.5 4.5-4.5 2Z" />
                </svg>
                Match with a Partner
              </button>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-[28px] border border-white/[0.06] bg-[#1a1b1e] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-semibold text-[#f5f5f5]">
                Pending Requests
              </h2>
              <span className="text-sm font-medium text-[#b8bac2]">
                {incomingRequests.length} Waiting
              </span>
            </div>

            {incomingRequests.length > 0 && (
              <button
                type="button"
                onClick={() => setIsRequestsOpen(true)}
                className="text-sm font-semibold text-[#c7ff20] transition hover:text-[#d3ff4d]"
              >
                View all
              </button>
            )}
          </div>

          <div className="mt-5 space-y-3">
            {loadingRequests ? (
              <>
                <div className="h-24 animate-pulse rounded-2xl bg-[#111214]" />
                <div className="h-24 animate-pulse rounded-2xl bg-[#111214]" />
              </>
            ) : incomingRequests.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-[#b8bac2]">
                No pending requests
              </p>
            ) : (
              previewRequests.map((request) => (
                <RequestRow
                  key={request.requestId}
                  request={request}
                  busy={isRequestBusy(request.requestId)}
                  onAccept={() => acceptMutation.mutate(request.requestId)}
                  onDecline={() => declineMutation.mutate(request.requestId)}
                />
              ))
            )}
          </div>
        </section>

        <FriendsSection
          friends={friends}
          isLoading={loadingFriends}
          isError={friendsError}
          onRetry={() =>
            void queryClient.invalidateQueries({ queryKey: ["friends"] })
          }
          onFindPartners={() =>
            document.getElementById("discover-learners")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
        />

        <section id="discover-learners" className="mt-6">
          <h2 className="text-xl font-semibold text-[#f5f5f5]">
            Discover Learners
          </h2>

          {loadingUsers || loadingFriends || loadingOutgoing ? (
            <div className="mt-5 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <FriendCardSkeleton key={index} />
              ))}
            </div>
          ) : discoverUsers.length === 0 ? (
            <p className="mt-5 rounded-[28px] border border-dashed border-white/10 bg-[#1a1b1e] px-4 py-10 text-center text-sm text-[#b8bac2]">
              No learners to discover right now
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
              {discoverUsers.map((user) => (
                <DiscoverCard
                  key={user.id}
                  user={user}
                  requested={outgoingRecipientIds.has(user.id)}
                  sending={
                    sendMutation.isPending && sendMutation.variables === user.id
                  }
                  onSendRequest={() => sendMutation.mutate(user.id)}
                />
              ))}
            </div>
          )}
        </section>
      </section>

      {isRequestsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsRequestsOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pending-requests-title"
            className="relative z-10 flex max-h-[min(720px,calc(100vh-2rem))] w-full max-w-2xl flex-col rounded-[28px] border border-white/10 bg-[#1a1b1e] p-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                id="pending-requests-title"
                className="text-xl font-semibold text-[#f5f5f5]"
              >
                Pending Requests
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsRequestsOpen(false)}
                aria-label="Close pending requests"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#b8bac2] transition hover:bg-white/5 hover:text-[#f5f5f5]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-3 overflow-y-auto pr-1">
              {incomingRequests.map((request) => (
                <RequestRow
                  key={request.requestId}
                  request={request}
                  busy={isRequestBusy(request.requestId)}
                  onAccept={() => acceptMutation.mutate(request.requestId)}
                  onDecline={() => declineMutation.mutate(request.requestId)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default HomePage;
