import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isValidAvatarUrl } from "@/lib/profile/avatarUrl";
import { parseDateOfBirthInput } from "@/lib/profile/dateOfBirth";
import { prisma } from "@/lib/db/prisma";

type PatchBody = {
  name?: unknown;
  avatarUrl?: unknown;
  dateOfBirth?: unknown;
};

function serializeUser(user: {
  name: string;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
}) {
  return {
    name: user.name,
    avatarUrl: user.avatarUrl,
    dateOfBirth: user.dateOfBirth?.toISOString() ?? null,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.email.toLowerCase() },
    select: { name: true, avatarUrl: true, dateOfBirth: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user: serializeUser(user) });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data: { name?: string; avatarUrl?: string | null; dateOfBirth?: Date | null } = {};

  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length < 1) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (name.length > 120) {
      return NextResponse.json({ error: "Name must be at most 120 characters." }, { status: 400 });
    }
    data.name = name;
  }

  if (body.avatarUrl !== undefined) {
    if (body.avatarUrl === null || body.avatarUrl === "") {
      data.avatarUrl = null;
    } else if (isValidAvatarUrl(body.avatarUrl)) {
      data.avatarUrl = body.avatarUrl;
    } else {
      return NextResponse.json({ error: "Invalid profile photo URL." }, { status: 400 });
    }
  }

  if (body.dateOfBirth !== undefined) {
    const parsed = parseDateOfBirthInput(body.dateOfBirth);
    if (parsed === "invalid") {
      return NextResponse.json({ error: "Invalid date of birth." }, { status: 400 });
    }
    data.dateOfBirth = parsed;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { email: session.email.toLowerCase() },
      data,
      select: { name: true, avatarUrl: true, dateOfBirth: true },
    });
    return NextResponse.json({ ok: true, user: serializeUser(user) });
  } catch {
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
  }
}
