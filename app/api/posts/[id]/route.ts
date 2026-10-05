import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getEngagementMaps,
  getViewerUserId,
  postAuthorSelect,
  serializePost,
} from "@/lib/posts/engagement";
import { prisma } from "@/lib/db/prisma";
import { parseAttachments } from "@/types/postAttachments";

type Params = { params: Promise<{ id: string }> };

const authorSelect = postAuthorSelect;

export async function GET(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Post id is required." }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: authorSelect } },
  });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const viewerUserId = await getViewerUserId(session.email);
  const { likeCounts, commentCounts, likedPostIds } = await getEngagementMaps(
    [id],
    viewerUserId,
  );

  return NextResponse.json({
    post: serializePost(post, {
      likeCount: likeCounts.get(id) ?? 0,
      commentCount: commentCounts.get(id) ?? 0,
      likedByViewer: likedPostIds.has(id),
    }),
  });
}

const POST_TYPES = new Set(["memory", "tribute", "condolence"]);

type PatchBody = {
  content?: string;
  type?: string;
};

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Post id is required." }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: authorSelect } },
  });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (post.author.email.toLowerCase() !== session.email.toLowerCase()) {
    return NextResponse.json(
      { error: "You can only edit your own posts." },
      { status: 403 },
    );
  }

  const attachments = parseAttachments(post.attachments);
  let nextContent = post.content;
  let nextType = post.type;

  if (body.content !== undefined) {
    nextContent = typeof body.content === "string" ? body.content.trim() : "";
  }
  if (body.type !== undefined) {
    const t = typeof body.type === "string" ? body.type : "";
    if (!POST_TYPES.has(t)) {
      return NextResponse.json({ error: "Invalid post type." }, { status: 400 });
    }
    nextType = t as "memory" | "tribute" | "condolence";
  }

  if (!nextContent && attachments.length === 0) {
    return NextResponse.json(
      { error: "Post must have text or at least one attachment." },
      { status: 400 },
    );
  }
  if (nextContent.length > 2000) {
    return NextResponse.json({ error: "Post content is too long." }, { status: 400 });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      content: nextContent,
      type: nextType,
    },
  });

  const viewerUserId = await getViewerUserId(session.email);
  const { likeCounts, commentCounts, likedPostIds } = await getEngagementMaps(
    [id],
    viewerUserId,
  );

  return NextResponse.json({
    post: serializePost(
      {
        id: updated.id,
        type: updated.type,
        content: updated.content,
        attachments: updated.attachments,
        createdAt: updated.createdAt,
        author: post.author,
      },
      {
        likeCount: likeCounts.get(id) ?? 0,
        commentCount: commentCounts.get(id) ?? 0,
        likedByViewer: likedPostIds.has(id),
      },
    ),
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Post id is required." }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { email: true } } },
  });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (post.author.email.toLowerCase() !== session.email.toLowerCase()) {
    return NextResponse.json(
      { error: "You can only delete your own posts." },
      { status: 403 },
    );
  }

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
