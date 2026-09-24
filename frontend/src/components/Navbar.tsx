import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Languages, LogOut, Search } from "lucide-react";

import useAuthUser from "../hooks/useAuthUser";
import { logout } from "../lib/api";
import NotificationBell from "./notifications/NotificationBell";
import ThemeSelector from "./ThemeSelector";

const iconButton =
  "flex size-10 items-center justify-center rounded-lg text-base-content/60 transition-colors hover:bg-base-content/10 hover:text-base-content";

const getInitials = (fullname?: string): string => {
  if (!fullname) return "U";

  const parts = fullname.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  const isChatPage =
    location.pathname === "/chat" || location.pathname.startsWith("/chat/");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { mutateAsync: logoutMutation, isPending: isLoggingOut } = useMutation({
    mutationFn: logout,
  });

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      await logoutMutation();

      setIsProfileOpen(false);

      // After logout, GET /auth/me returns 401. React Query keeps the last
      // successful user unless we clear the cache first — otherwise App.tsx
      // still sees authUser and /login redirects back to the dashboard.
      queryClient.setQueryData(["authUser"], null);
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });

      navigate("/login", { replace: true });
    } catch {
      toast.error("Unable to logout");
    }
  };

  const displayName = authUser?.fullname || "User";
  const avatarUrl = authUser?.profileurl;

  // Minimal branding-only navbar for the chat experience.
  if (isChatPage) {
    return (
      <header className="flex h-16 items-center border-b border-base-content/10 bg-base-100 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Languages
            className="size-6 text-primary"
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="text-lg font-semibold text-base-content">Yapply</span>
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-16 items-center gap-3 border-b border-base-content/10 bg-base-100 px-4 sm:px-6">
      {/* Search (primary left element) */}
      <div className="relative min-w-0 max-w-[650px] flex-1">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-base-content/50"
          aria-hidden="true"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search learners..."
          aria-label="Search"
          className="h-10 w-full rounded-lg border border-base-content/15 bg-base-200 pl-10 pr-3.5 text-sm text-base-content outline-none transition placeholder:text-base-content/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {/* Right utilities */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeSelector />

        <NotificationBell className={iconButton} />

        {/* Profile + logout */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((open) => !open)}
            aria-label="Open profile menu"
            className="flex items-center rounded-full outline-none ring-offset-2 ring-offset-base-100 focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="size-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-base-300 text-sm font-medium text-base-content">
                {getInitials(authUser?.fullname)}
              </span>
            )}
          </button>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-base-content/10 bg-base-100 p-1.5 shadow-xl">
                <div className="border-b border-base-content/10 px-3 py-2">
                  <p className="truncate text-sm font-medium text-base-content">
                    {displayName}
                  </p>
                  {authUser?.email && (
                    <p className="truncate text-xs text-base-content/60">
                      {authUser.email}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  aria-label="Log out"
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-base-content transition-colors hover:bg-base-content/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
