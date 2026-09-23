import { useState, type ReactNode } from "react";
import { Menu, X, Zap } from "lucide-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

type LayoutProps = {
  children: ReactNode;
  showSideBar?: boolean;
};

const Layout = ({ children, showSideBar = false }: LayoutProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      {/* Mobile top bar (only below md) */}
      {showSideBar && (
        <header className="flex items-center justify-between border-b border-base-content/10 bg-base-100 px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <Zap
              className="size-5 text-primary"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span className="text-lg font-semibold text-base-content">Yapply</span>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-base-content transition-colors hover:bg-base-content/10"
          >
            <Menu className="size-6" aria-hidden="true" />
          </button>
        </header>
      )}

      {/* Mobile drawer + overlay (only below md) */}
      {showSideBar && (
        <div
          className={`fixed inset-0 z-50 md:hidden ${
            isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* Overlay */}
          <div
            onClick={closeDrawer}
            className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
              isDrawerOpen ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            className={`absolute left-0 top-0 h-full w-[280px] bg-base-100 shadow-xl transition-transform duration-200 ${
              isDrawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close navigation"
              className="absolute right-3 top-4 z-10 rounded-lg p-2 text-base-content/60 transition-colors hover:bg-base-content/10 hover:text-base-content"
            >
              <X className="size-5" aria-hidden="true" />
            </button>

            <Sidebar variant="full" onNavigate={closeDrawer} />
          </div>
        </div>
      )}

      {/* App shell */}
      <div className="flex min-h-screen">
        {showSideBar && <Sidebar />}

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />

          <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
