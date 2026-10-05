import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getViewerUserId } from "@/lib/posts/engagement";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: postId } = await params;
  if (!postId) {
    return NextResponse.json({ error: "Post id is required." }, { status: 400 });
  }

  const viewerId = await getViewerUserId(session.email);
  if (!viewerId) {
    return NextResponse.json({ error: "User account not found." }, { status: 404 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (!("postLike" in prisma)) {
    return NextResponse.json(
      {
        error:
          "Likes are not available yet. Stop the dev server, run npx prisma generate, then restart.",
      },
      { status: 503 },
    );
  }

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: viewerId } },
  });

  let liked: boolean;
  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    liked = false;
  } else {
    await prisma.postLike.create({ data: { postId, userId: viewerId } });
    liked = true;
  }

  const likeCount = await prisma.postLike.count({ where: { postId } });

  return NextResponse.json({ liked, likeCount });
}
