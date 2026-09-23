import { NavLink } from "react-router-dom";
import {
  Bell,
  Headphones,
  House,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

import useAuthUser from "../hooks/useAuthUser";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  end?: boolean;
};

// Single source of truth for navigation, reused across desktop, tablet rail,
// and the mobile drawer.
const navigationItems: NavigationItem[] = [
  { label: "Home", href: "/", icon: House, end: true },
  { label: "Friends", href: "/friends", icon: UsersRound },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Voice Rooms", href: "/call", icon: Headphones, badge: "NEW" },
];

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

type SidebarProps = {
  // "responsive": persistent shell (icon rail on tablet, full on desktop).
  // "full": always-expanded body used inside the mobile drawer.
  variant?: "responsive" | "full";
  onNavigate?: () => void;
};

const Sidebar = ({ variant = "responsive", onNavigate }: SidebarProps) => {
  const { authUser } = useAuthUser();

  const isFull = variant === "full";
  const displayName = authUser?.fullname || "User";
  const avatarUrl = authUser?.profileurl;

  return (
    <aside
      className={
        isFull
          ? "flex h-full w-full flex-col bg-base-100 text-base-content"
          : "hidden h-screen w-20 shrink-0 flex-col border-r border-base-content/10 bg-base-100 text-base-content md:flex lg:w-[260px]"
      }
    >
      {/* Brand */}
      <div
        className={
          isFull
            ? "flex items-center gap-3 px-6 py-6"
            : "flex items-center justify-center gap-3 px-4 py-6 lg:justify-start lg:px-6"
        }
      >
        <Zap
          className="size-6 shrink-0 text-primary"
          strokeWidth={2}
          aria-hidden="true"
        />
        <span
          className={
            isFull
              ? "text-xl font-semibold text-base-content"
              : "hidden text-xl font-semibold text-base-content lg:inline"
          }
        >
          Yapply
        </span>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className={
          isFull
            ? "mt-6 flex flex-col gap-2 px-4"
            : "mt-6 flex flex-col gap-2 px-3 lg:px-4"
        }
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              onClick={onNavigate}
              title={!isFull ? item.label : undefined}
              className={({ isActive }) =>
                [
                  "relative flex h-12 items-center gap-3 rounded-xl text-[15px] font-medium transition-colors",
                  isFull
                    ? "justify-start px-3.5"
                    : "justify-center lg:justify-start lg:px-3.5",
                  isActive
                    ? "bg-base-300 text-base-content"
                    : "text-base-content/60 hover:bg-base-content/5 hover:text-base-content",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={
                      isActive
                        ? "size-5 shrink-0 text-primary"
                        : "size-5 shrink-0 text-base-content/50"
                    }
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />

                  <span className={isFull ? "flex-1" : "hidden flex-1 lg:block"}>
                    {item.label}
                  </span>

                  {/* Full NEW badge (desktop + mobile drawer) */}
                  {item.badge && (
                    <span
                      className={[
                        "rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-primary-content",
                        isFull ? "inline-flex" : "hidden lg:inline-flex",
                      ].join(" ")}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Compact lime dot for the tablet icon rail */}
                  {item.badge && !isFull && (
                    <span
                      className="absolute right-2 top-2 size-2 rounded-full bg-primary lg:hidden"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Spacer pushes the profile to the bottom */}
      <div className="flex-1" />

      {/* Profile */}
      <div
        className={
          isFull
            ? "flex items-center gap-3 px-6 pb-6"
            : "flex items-center justify-center gap-3 px-4 pb-6 lg:justify-start lg:px-6"
        }
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-base-300 text-sm font-medium text-base-content">
            {getInitials(authUser?.fullname)}
          </div>
        )}

        <div className={isFull ? "min-w-0" : "hidden min-w-0 lg:block"}>
          <p className="truncate text-sm font-medium text-base-content">
            {displayName}
          </p>
          <span className="flex items-center gap-1.5 text-xs text-base-content/60">
            <span
              className="size-2 rounded-full bg-success"
              aria-hidden="true"
            />
            Online
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
