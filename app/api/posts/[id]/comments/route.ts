import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getViewerUserId,
  postAuthorSelect,
  serializeComment,
} from "@/lib/posts/engagement";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

const authorSelect = postAuthorSelect;

export async function GET(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: postId } = await params;
  if (!postId) {
    return NextResponse.json({ error: "Post id is required." }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (!("postComment" in prisma)) {
    return NextResponse.json(
      {
        error:
          "Comments are not available yet. Stop the dev server, run npx prisma generate, then restart.",
      },
      { status: 503 },
    );
  }

  const comments = await prisma.postComment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: authorSelect } },
  });

  return NextResponse.json({
    comments: comments.map(serializeComment),
  });
}

type CreateBody = { content?: string };

export async function POST(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: postId } = await params;
  if (!postId) {
    return NextResponse.json({ error: "Post id is required." }, { status: 400 });
  }

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: "Comment is too long." }, { status: 400 });
  }

  const viewerId = await getViewerUserId(session.email);
  if (!viewerId) {
    return NextResponse.json({ error: "User account not found." }, { status: 404 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (!("postComment" in prisma)) {
    return NextResponse.json(
      {
        error:
          "Comments are not available yet. Stop the dev server, run npx prisma generate, then restart.",
      },
      { status: 503 },
    );
  }

  const comment = await prisma.postComment.create({
    data: { postId, authorId: viewerId, content },
    include: { author: { select: authorSelect } },
  });

  const commentCount = await prisma.postComment.count({ where: { postId } });

  return NextResponse.json(
    {
      comment: serializeComment(comment),
      commentCount,
    },
    { status: 201 },
  );
}
