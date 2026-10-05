import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/components/feed/PostCard";
import { getSession } from "@/lib/auth/session";
import {
  getEngagementMaps,
  getViewerUserId,
  postAuthorSelect,
  serializePost,
} from "@/lib/posts/engagement";
import { prisma } from "@/lib/db/prisma";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    notFound();
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: postAuthorSelect },
    },
  });

  if (!post) {
    notFound();
  }

  const viewerUserId = await getViewerUserId(session.email);
  const { likeCounts, commentCounts, likedPostIds } = await getEngagementMaps(
    [id],
    viewerUserId,
  );

  const serialized = serializePost(post, {
    likeCount: likeCounts.get(id) ?? 0,
    commentCount: commentCounts.get(id) ?? 0,
    likedByViewer: likedPostIds.has(id),
  });

  const isAuthor =
    post.author.email.toLowerCase() === session.email.toLowerCase();

  return (
    <div className="space-y-4">
      <Link
        href="/"
        className="inline-flex text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        ← Back to feed
      </Link>
      <PostCard
        postId={serialized.id}
        authorName={serialized.author.name}
        authorEmail={serialized.author.email}
        authorProfileUserId={serialized.author.id}
        authorAvatarUrl={serialized.author.avatarUrl}
        content={serialized.content}
        attachments={serialized.attachments}
        postType={serialized.type}
        createdAt={new Date(serialized.createdAt)}
        canManage={isAuthor}
        likeCount={serialized.likeCount}
        commentCount={serialized.commentCount}
        likedByViewer={serialized.likedByViewer}
      />
    </div>
  );
}
