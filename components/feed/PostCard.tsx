"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import type { MemorialPostType } from "@/components/feed/FeedContext";
import { useFeed } from "@/components/feed/FeedContext";
import PostEngagement from "@/components/feed/PostEngagement";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import type { PostAttachment } from "@/types/postAttachments";

const TYPE_LABEL: Record<MemorialPostType, string> = {
  memory: "Memory",
  tribute: "Tribute",
  condolence: "Condolence",
};

type PostCardProps = {
  postId: string;
  authorName: string;
  authorEmail: string;
  authorAvatarUrl?: string | null;
  /** When set, the author name links to this user’s profile. */
  authorProfileUserId?: string;
  content: string;
  attachments?: PostAttachment[];
  postType: MemorialPostType;
  createdAt: Date;
  /** Viewer may edit/delete this post (their own). */
  canManage?: boolean;
  likeCount?: number;
  commentCount?: number;
  likedByViewer?: boolean;
  /** Flat style for profile timeline (no outer card chrome). */
  variant?: "card" | "flat";
};

export default function PostCard({
  postId,
  authorName,
  authorEmail,
  authorAvatarUrl = null,
  authorProfileUserId,
  content,
  attachments = [],
  postType,
  createdAt,
  canManage = false,
  likeCount = 0,
  commentCount = 0,
  likedByViewer = false,
  variant = "card",
}: PostCardProps) {
  const router = useRouter();
  const { deletePost, updatePost, deletingPostIds, updatingPostIds } = useFeed();
  const menuRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draftContent, setDraftContent] = useState(content);
  const [draftType, setDraftType] = useState<MemorialPostType>(postType);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const deleting = deletingPostIds.includes(postId);
  const updating = updatingPostIds.includes(postId);

  useEffect(() => {
    if (!menuOpen && !editOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen, editOpen]);

  useEffect(() => {
    if (!menuOpen || editOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, editOpen]);

  useEffect(() => {
    if (!editOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setEditOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editOpen]);

  function openEdit() {
    setDraftContent(content);
    setDraftType(postType);
    setEditError(null);
    setEditOpen(true);
    setMenuOpen(false);
  }

  async function handleSaveEdit() {
    const trimmed = draftContent.trim();
    if (!trimmed && attachments.length === 0) {
      setEditError("Add text or keep existing media — posts need text or an attachment.");
      return;
    }
    if (trimmed.length > 2000) {
      setEditError("Post content is too long (max 2000 characters).");
      return;
    }
    setEditError(null);
    setSavingEdit(true);
    try {
      await updatePost(postId, { content: trimmed, type: draftType });
      router.refresh();
      setEditOpen(false);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Could not save changes.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setMenuOpen(false);
    const ok = await deletePost(postId);
    if (ok) router.refresh();
  }

  const avatar = (
    <ProfileAvatar name={authorName} avatarUrl={authorAvatarUrl} size="sm" />
  );

  const articleClass =
    variant === "flat"
      ? "bg-white"
      : "overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm";

  return (
    <article className={articleClass}>
      <div className="p-3.5 sm:p-4">
        <div className="flex gap-3">
          {authorProfileUserId ? (
            <Link
              href={`/profile/${authorProfileUserId}`}
              className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/25"
            >
              {avatar}
            </Link>
          ) : (
            <div className="shrink-0">{avatar}</div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span className="truncate font-semibold text-gray-900 sm:text-[15px]">
                    {authorProfileUserId ? (
                      <Link
                        href={`/profile/${authorProfileUserId}`}
                        className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/25"
                      >
                        {authorName}
                      </Link>
                    ) : (
                      authorName
                    )}
                  </span>
                  <span className="shrink-0 text-gray-400">·</span>
                  <span className="shrink-0 text-xs text-gray-400 sm:text-sm">
                    {formatRelativeTime(createdAt)}
                  </span>
                </div>
                <p className="truncate text-xs text-gray-500">{authorEmail}</p>
                <span className="mt-1 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                  {TYPE_LABEL[postType]}
                </span>
              </div>

              {canManage && (
                <div className="relative shrink-0" ref={menuRef}>
                  <button
                    type="button"
                    aria-label="Post actions"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 sm:h-8 sm:w-8 sm:rounded-lg"
                  >
                    <MoreVertical className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </button>
                  {menuOpen && (
                    <ul
                      role="menu"
                      aria-label="Post actions"
                      className="absolute right-0 top-[calc(100%+4px)] z-20 min-w-[9rem] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg shadow-gray-900/10"
                    >
                      <li role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
                          onClick={openEdit}
                        >
                          Edit
                        </button>
                      </li>
                      <li role="none">
                        <button
                          type="button"
                          role="menuitem"
                          disabled={deleting}
                          className="flex w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                          onClick={() => void handleDelete()}
                        >
                          {deleting ? "Deleting…" : "Delete"}
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>

            {content.trim().length > 0 && (
              <p className="mt-2 break-words text-[15px] leading-relaxed whitespace-pre-wrap text-gray-800 sm:text-base">
                {content}
              </p>
            )}

            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((a) =>
                  a.type === "image" ? (
                    <img
                      key={a.url}
                      src={a.url}
                      alt=""
                      className="max-h-64 w-full rounded-lg border border-gray-100 bg-gray-50 object-contain sm:max-h-80"
                    />
                  ) : (
                    <video
                      key={a.url}
                      src={a.url}
                      controls
                      playsInline
                      className="max-h-64 w-full rounded-lg border border-gray-100 bg-black object-contain sm:max-h-80"
                    />
                  ),
                )}
              </div>
            )}

            <PostEngagement
              postId={postId}
              initialLikeCount={likeCount}
              initialCommentCount={commentCount}
              initialLikedByViewer={likedByViewer}
            />
          </div>
        </div>

        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close dialog"
              className="absolute inset-0 bg-black/40"
              onClick={() => !savingEdit && !updating && setEditOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-post-title"
              className="relative w-full max-w-[min(100%,28rem)] rounded-2xl border border-gray-100 bg-white p-4 shadow-xl shadow-gray-900/15"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2
                  id="edit-post-title"
                  className="text-base font-semibold tracking-tight text-gray-900"
                >
                  Edit post
                </h2>
                <button
                  type="button"
                  onClick={() => !savingEdit && !updating && setEditOpen(false)}
                  disabled={savingEdit || updating}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                  aria-label="Close"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>

              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Type
              </label>
              <select
                value={draftType}
                onChange={(e) => setDraftType(e.target.value as MemorialPostType)}
                disabled={savingEdit || updating}
                className="mb-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 disabled:opacity-50"
              >
                <option value="memory">{TYPE_LABEL.memory}</option>
                <option value="tribute">{TYPE_LABEL.tribute}</option>
                <option value="condolence">{TYPE_LABEL.condolence}</option>
              </select>

              <label
                htmlFor={`edit-post-body-${postId}`}
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500"
              >
                Text
              </label>
              <textarea
                id={`edit-post-body-${postId}`}
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                disabled={savingEdit || updating}
                rows={5}
                className="mb-3 w-full resize-y rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 outline-none focus-visible:border-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900/15 disabled:opacity-50"
              />

              {editError && (
                <p className="mb-3 text-sm text-red-700" role="alert">
                  {editError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => !savingEdit && !updating && setEditOpen(false)}
                  disabled={savingEdit || updating}
                  className="rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveEdit()}
                  disabled={
                    savingEdit ||
                    updating ||
                    (!draftContent.trim() && attachments.length === 0)
                  }
                  className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  {savingEdit || updating ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
