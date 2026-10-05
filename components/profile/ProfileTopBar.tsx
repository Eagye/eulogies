"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type ProfileTopBarProps = {
  name: string;
  isOwnProfile: boolean;
};

export default function ProfileTopBar({ name, isOwnProfile }: ProfileTopBarProps) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-3 border-b border-gray-200/80 px-3 py-3 sm:px-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-800 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-gray-900">
        {isOwnProfile ? "Your profile" : name}
      </h1>
      {!isOwnProfile && (
        <Link
          href="/profile"
          className="shrink-0 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          You
        </Link>
      )}
    </header>
  );
}
