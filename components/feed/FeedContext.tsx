"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { parseJsonResponse } from "@/lib/api/parseJsonResponse";
import type { PostAttachment } from "@/types/postAttachments";

export type MemorialPostType = "memory" | "tribute" | "condolence";

export type MemorialPost = {
  id: string;
  type: MemorialPostType;
  content: string;
  attachments: PostAttachment[];
  createdAt: Date;
  author: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
};

type FeedContextValue = {
  posts: MemorialPost[];
  loading: boolean;
  error: string | null;
  publishPost: (
    type: MemorialPostType,
    content: string,
    attachments?: PostAttachment[],
  ) => Promise<void>;
  deletePost: (id: string) => Promise<boolean>;
  updatePost: (
    id: string,
    patch: { content?: string; type?: MemorialPostType },
  ) => Promise<void>;
  deletingPostIds: string[];
  updatingPostIds: string[];
  viewerEmail: string;
  viewerName: string;
  viewerAvatarUrl: string | null;
  createDialogOpen: boolean;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
};

const FeedContext = createContext<FeedContextValue | null>(null);

type ApiPost = {
  id: string;
  type: MemorialPostType;
  content: string;
  attachments?: PostAttachment[];
  createdAt: string;
  author: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
  likeCount?: number;
  commentCount?: number;
  likedByViewer?: boolean;
};

function fromApiPost(post: ApiPost): MemorialPost {
  return {
    ...post,
    attachments: post.attachments ?? [],
    createdAt: new Date(post.createdAt),
    likeCount: post.likeCount ?? 0,
    commentCount: post.commentCount ?? 0,
    likedByViewer: post.likedByViewer ?? false,
  };
}

export function FeedProvider({
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
  const [posts, setPosts] = useState<MemorialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPostIds, setDeletingPostIds] = useState<string[]>([]);
  const [updatingPostIds, setUpdatingPostIds] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const openCreateDialog = useCallback(() => setCreateDialogOpen(true), []);
  const closeCreateDialog = useCallback(() => setCreateDialogOpen(false), []);

  useEffect(() => {
    let isMounted = true;
    async function loadPosts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/posts", { cache: "no-store" });
        const data = await parseJsonResponse<{ posts?: ApiPost[]; error?: string }>(res);
        if (!res.ok) {
          throw new Error(
            data.error ??
              (res.status === 500
                ? "Server error loading posts. Stop the dev server, run npx prisma generate, then restart."
                : "Could not load posts."),
          );
        }
        if (!isMounted) return;
        setPosts((data.posts ?? []).map(fromApiPost));
      } catch (e) {
        if (!isMounted) return;
        setError(e instanceof Error ? e.message : "Could not load posts.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void loadPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  const publishPost = useCallback(
    async (type: MemorialPostType, content: string, attachments: PostAttachment[] = []) => {
    const trimmed = content.trim();
    if (!trimmed && attachments.length === 0) return;
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        content: trimmed,
        attachments,
      }),
    });
    const data = (await res.json()) as { post?: ApiPost; error?: string };
    if (!res.ok || !data.post) {
      throw new Error(data.error ?? "Could not publish post.");
    }
    setPosts((prev) => [fromApiPost(data.post as ApiPost), ...prev]);
  },
  [],
);

  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    setDeletingPostIds((prev) => [...prev, id]);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not delete post.");
        return false;
      }
      setPosts((prev) => prev.filter((post) => post.id !== id));
      return true;
    } finally {
      setDeletingPostIds((prev) => prev.filter((postId) => postId !== id));
    }
  }, []);

  const updatePost = useCallback(
    async (id: string, patch: { content?: string; type?: MemorialPostType }) => {
      setError(null);
      setUpdatingPostIds((prev) => [...prev, id]);
      try {
        const res = await fetch(`/api/posts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        const data = (await res.json()) as { post?: ApiPost; error?: string };
        if (!res.ok || !data.post) {
          throw new Error(data.error ?? "Could not update post.");
        }
        const next = fromApiPost(data.post);
        setPosts((prev) => prev.map((p) => (p.id === id ? next : p)));
      } finally {
        setUpdatingPostIds((prev) => prev.filter((postId) => postId !== id));
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      posts,
      loading,
      error,
      publishPost,
      deletePost,
      updatePost,
      deletingPostIds,
      updatingPostIds,
      viewerEmail,
      viewerName,
      viewerAvatarUrl,
      createDialogOpen,
      openCreateDialog,
      closeCreateDialog,
    }),
    [
      posts,
      loading,
      error,
      publishPost,
      deletePost,
      updatePost,
      deletingPostIds,
      updatingPostIds,
      viewerEmail,
      viewerName,
      viewerAvatarUrl,
      createDialogOpen,
      openCreateDialog,
      closeCreateDialog,
    ],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) {
    throw new Error("useFeed must be used within FeedProvider");
  }
  return ctx;
}
