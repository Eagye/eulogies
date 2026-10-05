"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Home,
  MessageCircle,
  Settings,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

const navItem =
  "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-all duration-200 outline-none hover:bg-gray-100/90 hover:text-gray-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-gray-900/25 focus-visible:ring-offset-2";

const navItemActive =
  "bg-gray-900 text-white shadow-md shadow-gray-900/15 hover:bg-gray-800 hover:text-white";

const navItemQuiet = "text-gray-500 hover:text-gray-800";

type PlaceholderProps = {
  icon: typeof Home;
  label: string;
  hint?: string;
  onClick?: () => void;
};

function PlaceholderNavItem({
  icon: Icon,
  label,
  hint,
  onClick = () => {
    /* roadmap: communities / messages / settings */
  },
}: PlaceholderProps) {
  return (
    <button type="button" onClick={onClick} className={navItem} title={hint}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors duration-200 group-hover:bg-gray-200 group-hover:text-gray-900">
        <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block leading-tight">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[11px] font-normal text-gray-400 group-hover:text-gray-500">
            {hint}
          </span>
        ) : null}
      </span>
      <span className="inline-flex shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200/80">
        Soon
      </span>
    </button>
  );
}

export default function Sidebar({
  variant = "card",
  onNavigate,
}: {
  variant?: "card" | "drawer";
  /** Called after following an in-app nav link (e.g. to close the drawer). */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const homeActive = pathname === "/";
  const profileActive =
    pathname === "/profile" || pathname.startsWith("/profile/");
  const brochureActive = pathname.startsWith("/create-brochure");

  const rootClass =
    variant === "drawer"
      ? "flex min-h-0 flex-col bg-transparent p-3"
      : "sticky top-4 flex flex-col rounded-2xl border border-gray-200/80 bg-white/90 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/[0.03] backdrop-blur-md";

  return (
    <aside className={rootClass}>
      <div className="mb-4 flex items-center gap-2.5 px-2 pt-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 text-lg text-white shadow-inner shadow-white/10">
          <Sparkles className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-gray-900">Euloges</h2>
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Memorial & tributes
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 pt-1" aria-label="Main">
        <Link
          href="/"
          onClick={() => onNavigate?.()}
          className={`${navItem} ${homeActive ? navItemActive : navItemQuiet}`}
          aria-current={homeActive ? "page" : undefined}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              homeActive
                ? "bg-white/15 text-white"
                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-900"
            }`}
          >
            <Home className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col items-start">
            <span className="leading-tight">Home</span>
            <span
              className={`mt-0.5 text-[11px] font-normal ${
                homeActive ? "text-white/75" : "text-gray-400 group-hover:text-gray-500"
              }`}
            >
              Your feed
            </span>
          </span>
        </Link>

        <Link
          href="/profile"
          onClick={() => onNavigate?.()}
          className={`group ${navItem} ${profileActive ? navItemActive : navItemQuiet}`}
          aria-current={profileActive ? "page" : undefined}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              profileActive
                ? "bg-white/15 text-white"
                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-900"
            }`}
          >
            <UserRound className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col items-start">
            <span className="leading-tight">Profile</span>
            <span
              className={`mt-0.5 text-[11px] font-normal ${
                profileActive ? "text-white/75" : "text-gray-400 group-hover:text-gray-500"
              }`}
            >
              You & members
            </span>
          </span>
        </Link>

        <PlaceholderNavItem
          icon={Users}
          label="Communities"
          hint="Groups & memorial circles"
        />
        <PlaceholderNavItem
          icon={MessageCircle}
          label="Messages"
          hint="Direct & replies"
        />

        <Link
          href="/create-brochure"
          onClick={() => onNavigate?.()}
          className={`group ${navItem} ${brochureActive ? navItemActive : navItemQuiet}`}
          aria-current={brochureActive ? "page" : undefined}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              brochureActive
                ? "bg-white/15 text-white"
                : "bg-gray-100 text-gray-600 group-hover:bg-violet-100 group-hover:text-violet-800"
            }`}
          >
            <BookOpen className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col items-start">
            <span className="leading-tight">Brochure</span>
            <span
              className={`mt-0.5 text-[11px] font-normal ${
                brochureActive ? "text-white/75" : "text-gray-400 group-hover:text-gray-500"
              }`}
            >
              Printable tribute
            </span>
          </span>
        </Link>

        <PlaceholderNavItem
          icon={Settings}
          label="Settings"
          hint="Account & preferences"
        />
      </nav>

      <div className="mt-3 border-t border-gray-100 pt-3">
        <LogoutButton
          className={`${navItem} text-red-700 hover:bg-red-50 hover:text-red-800`}
          iconClassName="bg-red-50 text-red-600 group-hover:bg-red-100 group-hover:text-red-700"
        />
      </div>
    </aside>
  );
}
