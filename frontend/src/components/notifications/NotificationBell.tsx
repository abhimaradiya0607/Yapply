import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { getFriendRequests } from "../../lib/api";

const NotificationBell = ({ className }: { className: string }) => {
  const location = useLocation();
  const isActive = location.pathname === "/notifications";

  const { data } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const count = data?.incomingRequest.length ?? 0;
  const label =
    count > 0
      ? `Notifications, ${count > 99 ? "99+" : count} pending`
      : "Notifications";

  return (
    <Link
      to="/notifications"
      aria-label={label}
      className={`relative ${className} ${
        isActive ? "bg-[#222328] text-[#f5f5f5]" : ""
      }`}
    >
      <Bell className="size-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c7ff20] px-1 text-[10px] font-bold leading-none text-[#111214]">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
