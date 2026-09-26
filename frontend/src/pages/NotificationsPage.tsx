import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";

import ConnectionNotification from "../components/notifications/ConnectionNotification";
import FriendRequestNotification from "../components/notifications/FriendRequestNotification";
import NotificationSkeleton from "../components/notifications/NotificationSkeleton";
import {
  acceptFriendRequest,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  notificationQueryKeys,
  rejectFriendRequest,
  type AppNotification,
} from "../lib/api";

const refreshFriendData = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
  void queryClient.invalidateQueries({ queryKey: ["friends"] });
  void queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
  void queryClient.invalidateQueries({ queryKey: ["outgoingFriendRequests"] });
};

const refreshNotifications = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  void queryClient.invalidateQueries({
    queryKey: notificationQueryKeys.list,
  });
  void queryClient.invalidateQueries({
    queryKey: notificationQueryKeys.unreadCount,
  });
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: notificationQueryKeys.list,
    queryFn: getNotifications,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      refreshFriendData(queryClient);
      refreshNotifications(queryClient);
      toast.success("Friend request accepted.");
    },
    onError: () => {
      toast.error("Couldn't accept friend request.");
    },
  });

  const declineMutation = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      refreshFriendData(queryClient);
      refreshNotifications(queryClient);
      toast.success("Friend request declined.");
    },
    onError: () => {
      toast.error("Couldn't decline friend request.");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      refreshNotifications(queryClient);
    },
    onError: () => {
      toast.error("Couldn't update notification.");
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      refreshNotifications(queryClient);
    },
    onError: () => {
      toast.error("Couldn't update notification.");
    },
  });

  const friendRequests = notifications.filter(
    (notification) => notification.type === "friend_request",
  );
  const acceptedRequests = notifications.filter(
    (notification) => notification.type === "friend_request_accepted",
  );

  const openAcceptedNotification = (notification: AppNotification) => {
    if (notification.readAt || markReadMutation.isPending) return;
    markReadMutation.mutate(notification.id);
  };

  return (
    <main className="min-h-screen bg-base-100 px-4 py-6 text-base-content sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
              Notifications
            </h1>
            <p className="mt-2 text-sm text-base-content/70 sm:text-base">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "Friend requests and recent connections."}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="rounded-xl border border-base-content/10 bg-base-200 px-4 py-2 text-sm font-semibold text-base-content transition hover:bg-base-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markAllReadMutation.isPending ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>

        <div className="mt-8" aria-busy={isLoading}>
          {isLoading ? (
            <div className="space-y-3">
              <NotificationSkeleton />
              <NotificationSkeleton />
            </div>
          ) : isError ? (
            <div className="rounded-[24px] border border-base-content/10 bg-base-200 px-6 py-8">
              <h2 className="text-base font-semibold text-base-content">
                Couldn&apos;t load notifications
              </h2>
              <p className="mt-1 text-sm text-base-content/70">Try again in a moment.</p>
              <button
                type="button"
                onClick={() => refreshNotifications(queryClient)}
                className="mt-4 rounded-xl border border-base-content/10 bg-base-300 px-4 py-2 text-sm font-semibold text-base-content transition hover:bg-base-content/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Retry
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-base-content/10 bg-base-200 px-6 py-12 text-center">
              <Bell
                className="mx-auto size-6 text-base-content/60"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-semibold text-base-content">
                You&apos;re all caught up.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-base-content/70">
                No new activity.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {friendRequests.length > 0 && (
                <section aria-labelledby="friend-requests-heading">
                  <div className="flex items-center gap-3">
                    <h2
                      id="friend-requests-heading"
                      className="text-xl font-semibold text-base-content"
                    >
                      Friend Requests
                    </h2>
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-content">
                      {friendRequests.length}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {friendRequests.map((notification) => (
                      <FriendRequestNotification
                        key={notification.id}
                        isUnread={!notification.readAt}
                        request={{
                          requestId: notification.entityId,
                          status: "pending",
                          createdAt: notification.createdAt,
                          sender: notification.actor,
                        }}
                        isAccepting={
                          acceptMutation.isPending &&
                          acceptMutation.variables === notification.entityId
                        }
                        isDeclining={
                          declineMutation.isPending &&
                          declineMutation.variables === notification.entityId
                        }
                        onAccept={() =>
                          acceptMutation.mutate(notification.entityId)
                        }
                        onDecline={() =>
                          declineMutation.mutate(notification.entityId)
                        }
                      />
                    ))}
                  </div>
                </section>
              )}

              {acceptedRequests.length > 0 && (
                <section aria-labelledby="new-connections-heading">
                  <div className="flex items-center gap-3">
                    <h2
                      id="new-connections-heading"
                      className="text-xl font-semibold text-base-content"
                    >
                      New Connections
                    </h2>
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-content">
                      {acceptedRequests.length}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {acceptedRequests.map((notification) => (
                      <ConnectionNotification
                        key={notification.id}
                        isUnread={!notification.readAt}
                        onOpen={() => openAcceptedNotification(notification)}
                        connection={{
                          requestId: notification.entityId,
                          status: "accepted",
                          createdAt: notification.createdAt,
                          friend: notification.actor,
                        }}
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
