"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ComposeFab from "@/components/feed/ComposeFab";
import FeedColumn from "@/components/feed/FeedColumn";
import PostCard from "@/components/feed/PostCard";
import { useFeed } from "@/components/feed/FeedContext";

function FeedSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm"
        >
          <div className="flex gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-4/5 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardHome() {
  const { posts, loading, error, viewerEmail, openCreateDialog } = useFeed();
  const searchParams = useSearchParams();
  const router = useRouter();
  const compose = searchParams.get("compose");

  useEffect(() => {
    if (compose !== "1") return;
    openCreateDialog();
    router.replace("/", { scroll: false });
  }, [compose, router, openCreateDialog]);

  return (
    <>
      <FeedColumn>
        <div className="feed-scroll-pad space-y-3 sm:space-y-4">
          {loading && <FeedSkeleton />}

          {error && (
            <p
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}

          {!loading && posts.length === 0 && !error && (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-14 text-center shadow-sm">
              <p className="text-sm text-gray-600">
                No posts yet.
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Tap the blue <strong className="font-semibold text-[#1d9bf0]">+</strong>{" "}
                button to share a memory, tribute, or condolence.
              </p>
            </div>
          )}

          {!loading &&
            posts.map((post) => (
              <PostCard
                key={post.id}
                postId={post.id}
                authorName={post.author.name}
                authorEmail={post.author.email}
                authorProfileUserId={post.author.id}
                authorAvatarUrl={post.author.avatarUrl}
                content={post.content}
                attachments={post.attachments}
                postType={post.type}
                createdAt={post.createdAt}
                canManage={
                  post.author.email.toLowerCase() === viewerEmail.toLowerCase()
                }
                likeCount={post.likeCount}
                commentCount={post.commentCount}
                likedByViewer={post.likedByViewer}
              />
            ))}
        </div>
      </FeedColumn>

      <ComposeFab />
    </>
  );
}
