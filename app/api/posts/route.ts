import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getViewerUserId,
  postAuthorSelect,
  serializePost,
  serializePostsWithEngagement,
} from "@/lib/posts/engagement";
import { prisma } from "@/lib/db/prisma";
import { parseAttachments, validateAttachmentsInput } from "@/types/postAttachments";

type CreatePostBody = {
  type?: "memory" | "tribute" | "condolence";
  content?: string;
  attachments?: unknown;
};

const POST_TYPES = new Set(["memory", "tribute", "condolence"]);

export async function GET() {
  try {
    const session = await getSession();
    const viewerUserId = session ? await getViewerUserId(session.email) : null;

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: postAuthorSelect,
        },
      },
    });

    const serialized = await serializePostsWithEngagement(posts, viewerUserId);

    return NextResponse.json({ posts: serialized });
  } catch (e) {
    console.error("GET /api/posts failed:", e);
    const message =
      e instanceof Error && e.message.includes("postLike")
        ? "Database client is out of date. Stop the dev server, run npx prisma generate, then npm run dev."
        : "Could not load posts.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: CreatePostBody;
  try {
    body = (await request.json()) as CreatePostBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const type = typeof body.type === "string" ? body.type : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const attachments = validateAttachmentsInput(body.attachments);
  if (attachments === null) {
    return NextResponse.json({ error: "Invalid attachments." }, { status: 400 });
  }

  if (!POST_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid post type." }, { status: 400 });
  }
  const postType = type as "memory" | "tribute" | "condolence";
  if (!content && attachments.length === 0) {
    return NextResponse.json(
      { error: "Add a message, photo, or video." },
      { status: 400 },
    );
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "Post content is too long." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.email.toLowerCase() },
    select: postAuthorSelect,
  });
  if (!user) {
    return NextResponse.json({ error: "User account not found." }, { status: 404 });
  }

  const post = await prisma.post.create({
    data: {
      type: postType,
      content,
      attachments: attachments.length > 0 ? attachments : undefined,
      authorId: user.id,
    },
  });

  return NextResponse.json(
    {
      post: serializePost(
        {
          id: post.id,
          type: post.type,
          content: post.content,
          attachments: post.attachments,
          createdAt: post.createdAt,
          author: user,
        },
        { likeCount: 0, commentCount: 0, likedByViewer: false },
      ),
    },
    { status: 201 },
  );
}
