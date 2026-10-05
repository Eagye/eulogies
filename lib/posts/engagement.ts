import type { MemorialPostType } from "@/components/feed/FeedContext";
import { prisma } from "@/lib/db/prisma";
import { parseAttachments } from "@/types/postAttachments";

export const postAuthorSelect = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
} as const;

export type PostAuthor = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

export type SerializedPost = {
  id: string;
  type: MemorialPostType;
  content: string;
  attachments: ReturnType<typeof parseAttachments>;
  createdAt: string;
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
};

export type SerializedComment = {
  id: string;
  content: string;
  createdAt: string;
  author: PostAuthor;
};

type PostWithAuthor = {
  id: string;
  type: MemorialPostType;
  content: string;
  attachments: unknown;
  createdAt: Date;
  author: PostAuthor;
};

export async function getViewerUserId(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  return user?.id ?? null;
}

/** True when Prisma client includes like/comment models (requires generate + server restart). */
function hasEngagementModels(): boolean {
  const client = prisma as { postLike?: { groupBy: unknown }; postComment?: { groupBy: unknown } };
  return Boolean(client.postLike?.groupBy && client.postComment?.groupBy);
}

export async function getEngagementMaps(
  postIds: string[],
  viewerUserId: string | null,
): Promise<{
  likeCounts: Map<string, number>;
  commentCounts: Map<string, number>;
  likedPostIds: Set<string>;
}> {
  const likeCounts = new Map<string, number>();
  const commentCounts = new Map<string, number>();
  const likedPostIds = new Set<string>();

  if (postIds.length === 0) {
    return { likeCounts, commentCounts, likedPostIds };
  }

  if (!hasEngagementModels()) {
    console.warn(
      "Prisma client missing PostLike/PostComment. Stop dev server, run: npx prisma generate, then npm run dev",
    );
    return { likeCounts, commentCounts, likedPostIds };
  }

  const [likeGroups, commentGroups, viewerLikes] = await Promise.all([
    prisma.postLike.groupBy({
      by: ["postId"],
      where: { postId: { in: postIds } },
      _count: { postId: true },
    }),
    prisma.postComment.groupBy({
      by: ["postId"],
      where: { postId: { in: postIds } },
      _count: { postId: true },
    }),
    viewerUserId
      ? prisma.postLike.findMany({
          where: { postId: { in: postIds }, userId: viewerUserId },
          select: { postId: true },
        })
      : Promise.resolve([]),
  ]);

  for (const row of likeGroups) {
    likeCounts.set(row.postId, row._count.postId);
  }
  for (const row of commentGroups) {
    commentCounts.set(row.postId, row._count.postId);
  }
  for (const row of viewerLikes) {
    likedPostIds.add(row.postId);
  }

  return { likeCounts, commentCounts, likedPostIds };
}

export function serializePost(
  post: PostWithAuthor,
  engagement: {
    likeCount: number;
    commentCount: number;
    likedByViewer: boolean;
  },
): SerializedPost {
  return {
    id: post.id,
    type: post.type,
    content: post.content,
    attachments: parseAttachments(post.attachments),
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    likeCount: engagement.likeCount,
    commentCount: engagement.commentCount,
    likedByViewer: engagement.likedByViewer,
  };
}

export async function serializePostsWithEngagement(
  posts: PostWithAuthor[],
  viewerUserId: string | null,
): Promise<SerializedPost[]> {
  const postIds = posts.map((p) => p.id);
  const { likeCounts, commentCounts, likedPostIds } = await getEngagementMaps(
    postIds,
    viewerUserId,
  );

  return posts.map((post) =>
    serializePost(post, {
      likeCount: likeCounts.get(post.id) ?? 0,
      commentCount: commentCounts.get(post.id) ?? 0,
      likedByViewer: likedPostIds.has(post.id),
    }),
  );
}

export function serializeComment(comment: {
  id: string;
  content: string;
  createdAt: Date;
  author: PostAuthor;
}): SerializedComment {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    author: comment.author,
  };
}
