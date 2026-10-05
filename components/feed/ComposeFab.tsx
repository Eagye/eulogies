"use client";

import { Plus } from "lucide-react";
import { useFeed } from "@/components/feed/FeedContext";

export default function ComposeFab() {
  const { openCreateDialog } = useFeed();

  return (
    <button
      type="button"
      onClick={openCreateDialog}
      aria-label="Create post"
      className="fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1d9bf0] text-white shadow-[0_4px_14px_rgba(29,155,240,0.45)] transition hover:bg-[#1a8cd8] hover:shadow-[0_6px_20px_rgba(29,155,240,0.5)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9bf0] focus-visible:ring-offset-2 max-sm:h-[3.25rem] max-sm:w-[3.25rem] right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] sm:right-6 sm:bottom-6"
    >
      <Plus className="h-7 w-7 max-sm:h-6 max-sm:w-6" strokeWidth={2.75} aria-hidden />
    </button>
  );
}
