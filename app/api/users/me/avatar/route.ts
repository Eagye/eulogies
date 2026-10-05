import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;

const IMAGE_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/gif", "gif"],
  ["image/webp", "webp"],
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
  const ext = IMAGE_TYPES.get(mime);
  if (!ext) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, GIF, or WebP image." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 4 MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  const dir = join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);

  const avatarUrl = `/uploads/avatars/${filename}`;

  const user = await prisma.user.update({
    where: { email: session.email.toLowerCase() },
    data: { avatarUrl },
    select: { name: true, avatarUrl: true, dateOfBirth: true },
  });

  return NextResponse.json({
    avatarUrl,
    user: {
      name: user.name,
      avatarUrl: user.avatarUrl,
      dateOfBirth: user.dateOfBirth?.toISOString() ?? null,
    },
  });
}
