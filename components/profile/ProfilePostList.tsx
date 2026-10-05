"use client";

import Link from "next/link";
import PostCard from "@/components/feed/PostCard";
import type { MemorialPostType } from "@/components/feed/FeedContext";
import type { PostAttachment } from "@/types/postAttachments";

export type ProfilePostRow = {
  id: string;
  type: MemorialPostType;
  content: string;
  attachments: PostAttachment[];
  createdAt: string;
  authorName: string;
  authorEmail: string;
  authorAvatarUrl: string | null;
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
};

export default function ProfilePostList({
  posts,
  viewerEmail,
  profileUserId,
  isOwnProfile = false,
}: {
  posts: ProfilePostRow[];
  viewerEmail: string;
  profileUserId: string;
  isOwnProfile?: boolean;
}) {
  if (posts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 text-center text-sm text-gray-500">
        {isOwnProfile ? (
          <>
            No posts yet.{" "}
            <Link href="/" className="font-medium text-gray-900 underline">
              Share something on the feed
            </Link>
            .
          </>
        ) : (
          "No posts yet."
        )}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          postId={post.id}
          authorName={post.authorName}
          authorEmail={post.authorEmail}
          authorProfileUserId={profileUserId}
          authorAvatarUrl={post.authorAvatarUrl}
          content={post.content}
          attachments={post.attachments}
          postType={post.type}
          createdAt={new Date(post.createdAt)}
          canManage={post.authorEmail.toLowerCase() === viewerEmail.toLowerCase()}
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          likedByViewer={post.likedByViewer}
        />
      ))}
    </div>
  );
}
