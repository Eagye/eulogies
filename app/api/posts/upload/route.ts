import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

const IMAGE_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/gif", "gif"],
  ["image/webp", "webp"],
]);

const VIDEO_TYPES = new Map<string, string>([
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["video/quicktime", "mov"],
]);

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  const imageExt = IMAGE_TYPES.get(mime);
  const videoExt = VIDEO_TYPES.get(mime);

  if (!imageExt && !videoExt) {
    return NextResponse.json(
      { error: "Unsupported type. Use JPG, PNG, GIF, WebP, MP4, WebM, or MOV." },
      { status: 400 },
    );
  }

  const maxBytes = imageExt ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "File is too large." }, { status: 400 });
  }

  const ext = imageExt ?? videoExt!;
  const kind = imageExt ? "image" : "video";
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  const dir = join(process.cwd(), "public", "uploads", "posts");

  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);

  const url = `/uploads/posts/${filename}`;
  return NextResponse.json({
    attachment: { type: kind, url },
  });
}
