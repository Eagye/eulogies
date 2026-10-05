"use client";

import { Menu, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import CreatePostDialog from "@/components/feed/CreatePostDialog";
import { FeedProvider } from "@/components/feed/FeedContext";
import RightPanel from "@/components/layout/RightPanel";
import Sidebar from "@/components/layout/Sidebar";

/** Auto-close drawer after this delay when opened (milliseconds). */
const AUTO_CLOSE_MS = 30_000;

export default function DashboardFrame({
  children,
  viewerEmail,
  viewerName,
  viewerAvatarUrl,
}: {
  children: ReactNode;
  viewerEmail: string;
  viewerName: string;
  viewerAvatarUrl: string | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearCloseTimer() {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function closeSidebar() {
    clearCloseTimer();
    setSidebarOpen(false);
  }

  function scheduleAutoClose() {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setSidebarOpen(false);
    }, AUTO_CLOSE_MS);
  }

  function openSidebar() {
    setSidebarOpen(true);
    scheduleAutoClose();
  }

  function toggleSidebar() {
    setSidebarOpen((wasOpen) => {
      if (wasOpen) {
        clearCloseTimer();
        return false;
      }
      scheduleAutoClose();
      return true;
    });
  }

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        clearCloseTimer();
        setSidebarOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  return (
    <FeedProvider
      viewerEmail={viewerEmail}
      viewerName={viewerName}
      viewerAvatarUrl={viewerAvatarUrl}
    >
      <CreatePostDialog />

      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-900 shadow-md shadow-gray-900/10 transition hover:bg-gray-50 hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/25 sm:left-4"
        aria-expanded={sidebarOpen}
        aria-controls="dashboard-sidebar"
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      >
        {sidebarOpen ? (
          <X className="h-5 w-5" strokeWidth={2} aria-hidden />
        ) : (
          <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
        )}
      </button>

      <div
        id="dashboard-sidebar-backdrop"
        className={`fixed inset-0 z-[55] bg-black/45 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!sidebarOpen}
        onClick={closeSidebar}
      />

      <div
        id="dashboard-sidebar"
        role="navigation"
        aria-hidden={!sidebarOpen}
        className={`fixed left-0 top-0 z-[56] flex h-full w-[min(100vw,20rem)] flex-col bg-white shadow-2xl ring-1 ring-black/5 transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col pt-[4.5rem]">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <Sidebar variant="drawer" onNavigate={closeSidebar} />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-0 pb-4 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] sm:px-4">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-12 lg:gap-6">
          <main className="min-w-0 px-3 sm:px-0 lg:col-span-8 lg:px-0">
            {children}
          </main>
          <aside className="hidden min-w-0 lg:col-span-4 lg:block">
            <div className="sticky top-[4.5rem]">
              <RightPanel />
            </div>
          </aside>
        </div>
      </div>
    </FeedProvider>
  );
}
