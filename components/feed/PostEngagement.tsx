"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Link2, MessageCircle } from "lucide-react";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { postShareUrl } from "@/lib/posts/postUrl";

export type PostCommentItem = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
};

type PostEngagementProps = {
  postId: string;
  initialLikeCount: number;
  initialCommentCount: number;
  initialLikedByViewer: boolean;
};

export default function PostEngagement({
  postId,
  initialLikeCount,
  initialCommentCount,
  initialLikedByViewer,
}: PostEngagementProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(initialLikedByViewer);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [liking, setLiking] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<PostCommentItem[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    setLikeCount(initialLikeCount);
    setLiked(initialLikedByViewer);
    setCommentCount(initialCommentCount);
  }, [initialLikeCount, initialLikedByViewer, initialCommentCount, postId]);

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    setCommentError(null);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, { cache: "no-store" });
      const data = (await res.json()) as {
        comments?: PostCommentItem[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not load comments.");
      }
      setComments(data.comments ?? []);
      setCommentsLoaded(true);
    } catch (e) {
      setCommentError(e instanceof Error ? e.message : "Could not load comments.");
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!commentsOpen || commentsLoaded) return;
    void loadComments();
  }, [commentsOpen, commentsLoaded, loadComments]);

  async function toggleLike() {
    if (liking) return;
    setLiking(true);
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = (await res.json()) as {
        liked?: boolean;
        likeCount?: number;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not update like.");
      }
      setLiked(data.liked ?? false);
      setLikeCount(data.likeCount ?? 0);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLiking(false);
    }
  }

  async function submitComment() {
    const trimmed = commentDraft.trim();
    if (!trimmed || postingComment) return;
    setPostingComment(true);
    setCommentError(null);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = (await res.json()) as {
        comment?: PostCommentItem;
        commentCount?: number;
        error?: string;
      };
      if (!res.ok || !data.comment) {
        throw new Error(data.error ?? "Could not post comment.");
      }
      setComments((prev) => [...prev, data.comment!]);
      setCommentCount(data.commentCount ?? commentCount + 1);
      setCommentDraft("");
      setCommentsLoaded(true);
    } catch (e) {
      setCommentError(e instanceof Error ? e.message : "Could not post comment.");
    } finally {
      setPostingComment(false);
    }
  }

  async function handleShare() {
    const url = postShareUrl(postId);
    try {
      await navigator.clipboard.writeText(url);
      setShareMessage("Link copied");
    } catch {
      setShareMessage(url);
    }
    window.setTimeout(() => setShareMessage(null), 2500);
  }

  return (
    <div className="border-t border-gray-100 pt-3 mt-1 space-y-3">
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => void toggleLike()}
          disabled={liking}
          aria-pressed={liked}
          aria-label={liked ? "Unlike post" : "Like post"}
          className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 disabled:opacity-50 sm:min-h-0 sm:rounded-lg sm:px-2.5 sm:py-1.5 ${
            liked
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Heart
            className="h-4 w-4"
            strokeWidth={2}
            fill={liked ? "currentColor" : "none"}
            aria-hidden
          />
          <span>{likeCount}</span>
          <span className="sr-only">{liked ? "Liked" : "Like"}</span>
        </button>

        <button
          type="button"
          onClick={() => setCommentsOpen((o) => !o)}
          aria-expanded={commentsOpen}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 sm:min-h-0 sm:rounded-lg sm:px-2.5 sm:py-1.5"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
          <span>{commentCount}</span>
          <span>Comment{commentCount === 1 ? "" : "s"}</span>
        </button>

        <button
          type="button"
          onClick={() => void handleShare()}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 sm:min-h-0 sm:rounded-lg sm:px-2.5 sm:py-1.5"
        >
          <Link2 className="h-4 w-4" strokeWidth={2} aria-hidden />
          Share
        </button>

        {shareMessage && (
          <span className="text-xs text-green-700" role="status">
            {shareMessage}
          </span>
        )}
      </div>

      {commentsOpen && (
        <div className="space-y-3 rounded-xl bg-gray-50/80 p-3">
          {loadingComments && !commentsLoaded && (
            <p className="text-xs text-gray-500">Loading comments…</p>
          )}
          {commentError && (
            <p className="text-xs text-red-700" role="alert">
              {commentError}
            </p>
          )}
          {!loadingComments && commentsLoaded && comments.length === 0 && (
            <p className="text-xs text-gray-500">No comments yet. Be the first.</p>
          )}
          <ul className="space-y-2">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-2 text-sm">
                <Link
                  href={`/profile/${c.author.id}`}
                  className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/25"
                >
                  <ProfileAvatar
                    name={c.author.name}
                    avatarUrl={c.author.avatarUrl}
                    size="sm"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <Link
                      href={`/profile/${c.author.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {c.author.name}
                    </Link>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(new Date(c.createdAt))}
                    </span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-gray-700">
                    {c.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row">
            <textarea
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              disabled={postingComment}
              placeholder="Write a comment…"
              rows={2}
              className="min-h-[2.5rem] flex-1 resize-y rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submitComment();
                }
              }}
            />
            <button
              type="button"
              onClick={() => void submitComment()}
              disabled={postingComment || !commentDraft.trim()}
              className="shrink-0 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 sm:self-end sm:px-3 sm:py-2 sm:text-xs"
            >
              {postingComment ? "…" : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
