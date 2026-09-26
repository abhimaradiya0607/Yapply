import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { getUnreadNotificationCount, notificationQueryKeys } from "../../lib/api";

const NotificationBell = ({ className }: { className: string }) => {
  const location = useLocation();
  const isActive = location.pathname === "/notifications";

  const { data: unreadCount = 0 } = useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const shownCount = unreadCount > 99 ? "99+" : unreadCount;
  const label =
    unreadCount > 0
      ? `Notifications, ${shownCount} unread`
      : "Notifications";

  return (
    <Link
      to="/notifications"
      aria-label={label}
      className={`relative ${className} ${
        isActive ? "bg-base-300 text-base-content" : ""
      }`}
    >
      <Bell className="size-5" aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-content">
          {shownCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
