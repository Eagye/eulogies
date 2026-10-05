"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

const defaultRow =
  "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 outline-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2";

export default function LogoutButton({
  className = "",
  iconClassName = "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-900",
}: {
  className?: string;
  iconClassName?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      router.push("/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={logout}
      className={`${defaultRow} ${className} disabled:pointer-events-none disabled:opacity-50`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${iconClassName}`}
      >
        <LogOut className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        {pending ? "Signing out…" : "Sign out"}
      </span>
    </button>
  );
}
