import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getViewerUserId } from "@/lib/posts/engagement";
import { brochureToDraft, draftToBrochureData } from "@/lib/brochure/serialize";
import { validateSectionsInput } from "@/lib/brochure/sections";
import { prisma } from "@/lib/db/prisma";
import type { BrochureSection } from "@/types/brochure";

type CreateBrochureBody = {
  name?: string;
  dob?: string;
  dod?: string;
  bio?: string;
  sections?: BrochureSection[];
  privacy?: "public" | "family";
  accessCode?: string;
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const userId = await getViewerUserId(session.email);
  if (!userId) {
    return NextResponse.json({ error: "User account not found." }, { status: 404 });
  }

  try {
    const brochures = await prisma.brochure.findMany({
      where: { creatorId: userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      brochures: brochures.map((b) =>
        brochureToDraft(b, { includeAccessCode: true, includeCreatorId: true }),
      ),
    });
  } catch (e) {
    console.error("GET /api/brochures failed:", e);
    return NextResponse.json({ error: "Could not load brochures." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const userId = await getViewerUserId(session.email);
  if (!userId) {
    return NextResponse.json({ error: "User account not found." }, { status: 404 });
  }

  let body: CreateBrochureBody;
  try {
    body = (await request.json()) as CreateBrochureBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { error: "Full name of the deceased is required." },
      { status: 400 },
    );
  }

  const sections = validateSectionsInput(body.sections ?? []);
  if (sections === null) {
    return NextResponse.json({ error: "Invalid brochure sections." }, { status: 400 });
  }

  const privacy = body.privacy === "family" ? "family" : "public";
  if (privacy === "family") {
    const code =
      typeof body.accessCode === "string" ? body.accessCode.trim() : "";
    if (!code) {
      return NextResponse.json(
        { error: "Family-only brochures need an access code." },
        { status: 400 },
      );
    }
  }

  const data = draftToBrochureData({
    name,
    dob: typeof body.dob === "string" ? body.dob : "",
    dod: typeof body.dod === "string" ? body.dod : "",
    bio: typeof body.bio === "string" ? body.bio : "",
    sections,
    privacy,
    accessCode: typeof body.accessCode === "string" ? body.accessCode : undefined,
  });

  try {
    const brochure = await prisma.brochure.create({
      data: {
        ...data,
        creatorId: userId,
      },
    });

    return NextResponse.json(
      {
        brochure: brochureToDraft(brochure, {
          includeAccessCode: true,
          includeCreatorId: true,
        }),
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("POST /api/brochures failed:", e);
    return NextResponse.json({ error: "Could not create brochure." }, { status: 500 });
  }
}
