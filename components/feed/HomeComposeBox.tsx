"use client";

import { ImagePlus, Video } from "lucide-react";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { useFeed } from "@/components/feed/FeedContext";

export default function HomeComposeBox() {
  const { openCreateDialog, viewerName, viewerAvatarUrl } = useFeed();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
      <button
        type="button"
        onClick={openCreateDialog}
        className="flex w-full gap-3 p-4 text-left transition hover:bg-gray-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-900/15"
      >
        <ProfileAvatar name={viewerName} avatarUrl={viewerAvatarUrl} size="sm" />
        <span className="flex min-h-[2.75rem] flex-1 items-center rounded-full border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-500">
          What would you like to share?
        </span>
      </button>

      <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-4 py-2.5">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={openCreateDialog}
            className="flex h-9 w-9 items-center justify-center rounded-full text-sky-600 transition hover:bg-sky-50"
            aria-label="Add photo"
          >
            <ImagePlus className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            onClick={openCreateDialog}
            className="flex h-9 w-9 items-center justify-center rounded-full text-violet-600 transition hover:bg-violet-50"
            aria-label="Add video"
          >
            <Video className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
        </div>
        <button
          type="button"
          onClick={openCreateDialog}
          className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2"
        >
          Post
        </button>
      </div>
    </div>
  );
}
