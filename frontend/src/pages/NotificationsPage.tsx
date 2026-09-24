import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";

import ConnectionNotification from "../components/notifications/ConnectionNotification";
import FriendRequestNotification from "../components/notifications/FriendRequestNotification";
import NotificationSkeleton from "../components/notifications/NotificationSkeleton";
import {
  acceptFriendRequest,
  getFriendRequests,
  rejectFriendRequest,
} from "../lib/api";

const refreshFriendData = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  void queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
  void queryClient.invalidateQueries({ queryKey: ["friends"] });
  void queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
  void queryClient.invalidateQueries({ queryKey: ["outgoingFriendRequests"] });
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const {
    data: friendRequests,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => refreshFriendData(queryClient),
  });

  const declineMutation = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => refreshFriendData(queryClient),
  });

  const incomingRequests = friendRequests?.incomingRequest ?? [];
  const acceptedConnections = friendRequests?.acceptedRequests ?? [];
  const isEmpty = incomingRequests.length === 0 && acceptedConnections.length === 0;

  return (
    <main className="min-h-screen bg-[#111214] px-4 py-6 text-[#f5f5f5] sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[#f5f5f5] sm:text-4xl">
          Notifications
        </h1>
        <p className="mt-2 text-sm text-[#b8bac2] sm:text-base">
          Friend requests and recent connections.
        </p>

        <div className="mt-8" aria-busy={isLoading}>
          {isLoading ? (
            <div className="space-y-3">
              <NotificationSkeleton />
              <NotificationSkeleton />
            </div>
          ) : isError ? (
            <div className="rounded-[24px] border border-white/[0.06] bg-[#1a1b1e] px-6 py-8">
              <h2 className="text-base font-semibold text-[#f5f5f5]">
                Couldn&apos;t load notifications
              </h2>
              <p className="mt-1 text-sm text-[#b8bac2]">Try again in a moment.</p>
              <button
                type="button"
                onClick={() =>
                  void queryClient.invalidateQueries({
                    queryKey: ["friendRequests"],
                  })
                }
                className="mt-4 rounded-xl border border-white/10 bg-[#222328] px-4 py-2 text-sm font-semibold text-[#f5f5f5] transition hover:bg-[#2a2b31] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c7ff20]"
              >
                Retry
              </button>
            </div>
          ) : isEmpty ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-[#1a1b1e] px-6 py-12 text-center">
              <Bell
                className="mx-auto size-6 text-[#9a9ca6]"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-semibold text-[#f5f5f5]">
                You&apos;re all caught up.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#b8bac2]">
                No new friend requests or connections right now.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {incomingRequests.length > 0 && (
                <section aria-labelledby="friend-requests-heading">
                  <div className="flex items-center gap-3">
                    <h2
                      id="friend-requests-heading"
                      className="text-xl font-semibold text-[#f5f5f5]"
                    >
                      Friend Requests
                    </h2>
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#c7ff20] px-2 text-xs font-bold text-[#111214]">
                      {incomingRequests.length}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {incomingRequests.map((request) => (
                      <FriendRequestNotification
                        key={request.requestId}
                        request={request}
                        isAccepting={
                          acceptMutation.isPending &&
                          acceptMutation.variables === request.requestId
                        }
                        isDeclining={
                          declineMutation.isPending &&
                          declineMutation.variables === request.requestId
                        }
                        onAccept={() =>
                          acceptMutation.mutate(request.requestId)
                        }
                        onDecline={() =>
                          declineMutation.mutate(request.requestId)
                        }
                      />
                    ))}
                  </div>
                </section>
              )}

              {acceptedConnections.length > 0 && (
                <section aria-labelledby="new-connections-heading">
                  <div className="flex items-baseline gap-3">
                    <h2
                      id="new-connections-heading"
                      className="text-xl font-semibold text-[#f5f5f5]"
                    >
                      New Connections
                    </h2>
                    <span className="text-sm font-medium text-[#b8bac2]">
                      {acceptedConnections.length}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {acceptedConnections.map((connection) => (
                      <ConnectionNotification
                        key={connection.requestId}
                        connection={connection}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default NotificationsPage;
