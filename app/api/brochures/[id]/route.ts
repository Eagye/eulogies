import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getViewerUserId } from "@/lib/posts/engagement";
import { brochureToDraft, draftToBrochureData } from "@/lib/brochure/serialize";
import { validateSectionsInput } from "@/lib/brochure/sections";
import { prisma } from "@/lib/db/prisma";
import type { BrochureSection } from "@/types/brochure";

type Params = { params: Promise<{ id: string }> };

type PatchBrochureBody = {
  name?: string;
  dob?: string;
  dod?: string;
  bio?: string;
  sections?: BrochureSection[];
  privacy?: "public" | "family";
  accessCode?: string;
};

function accessGranted(
  brochure: { privacy: string; accessCode: string | null; creatorId: string },
  viewerUserId: string | null,
  suppliedCode: string | null,
): boolean {
  if (viewerUserId && brochure.creatorId === viewerUserId) return true;
  if (brochure.privacy === "public") return true;
  if (!brochure.accessCode || !suppliedCode) return false;
  return brochure.accessCode === suppliedCode;
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Brochure id is required." }, { status: 400 });
  }

  const session = await getSession();
  const viewerUserId = session ? await getViewerUserId(session.email) : null;
  const suppliedCode = new URL(request.url).searchParams.get("accessCode");

  try {
    const brochure = await prisma.brochure.findUnique({ where: { id } });
    if (!brochure) {
      return NextResponse.json({ error: "Memorial not found." }, { status: 404 });
    }

    const allowed = accessGranted(brochure, viewerUserId, suppliedCode);

    if (!allowed) {
      return NextResponse.json(
        {
          requiresAccessCode: brochure.privacy === "family",
          brochure: {
            id: brochure.id,
            name: brochure.deceasedName,
            privacy: brochure.privacy,
          },
        },
        { status: 403 },
      );
    }

    const isOwner = viewerUserId === brochure.creatorId;

    return NextResponse.json({
      brochure: brochureToDraft(brochure, {
        includeAccessCode: isOwner,
        includeCreatorId: isOwner,
      }),
    });
  } catch (e) {
    console.error("GET /api/brochures/[id] failed:", e);
    return NextResponse.json({ error: "Could not load brochure." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const userId = await getViewerUserId(session.email);
  if (!userId) {
    return NextResponse.json({ error: "User account not found." }, { status: 404 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Brochure id is required." }, { status: 400 });
  }

  const existing = await prisma.brochure.findUnique({ where: { id } });
  if (!existing || existing.creatorId !== userId) {
    return NextResponse.json({ error: "Brochure not found." }, { status: 404 });
  }

  let body: PatchBrochureBody;
  try {
    body = (await request.json()) as PatchBrochureBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name =
    typeof body.name === "string" ? body.name.trim() : existing.deceasedName;
  if (!name) {
    return NextResponse.json(
      { error: "Full name of the deceased is required." },
      { status: 400 },
    );
  }

  let sections = parseBrochureSections(existing.sections);
  if (body.sections !== undefined) {
    const validated = validateSectionsInput(body.sections);
    if (validated === null) {
      return NextResponse.json({ error: "Invalid brochure sections." }, { status: 400 });
    }
    sections = validated;
  }

  const privacy =
    body.privacy === "family" || body.privacy === "public"
      ? body.privacy
      : (existing.privacy as "public" | "family");

  const patch = draftToBrochureData({
    name,
    dob: typeof body.dob === "string" ? body.dob : existing.dateOfBirth ?? "",
    dod: typeof body.dod === "string" ? body.dod : existing.dateOfDeath ?? "",
    bio: typeof body.bio === "string" ? body.bio : existing.bio,
    sections,
    privacy,
    accessCode:
      body.accessCode !== undefined
        ? body.accessCode
        : existing.accessCode ?? undefined,
  });

  if (patch.privacy === "family" && !patch.accessCode) {
    return NextResponse.json(
      { error: "Family-only brochures need an access code." },
      { status: 400 },
    );
  }

  try {
    const brochure = await prisma.brochure.update({
      where: { id },
      data: patch,
    });

    return NextResponse.json({
      brochure: brochureToDraft(brochure, {
        includeAccessCode: true,
        includeCreatorId: true,
      }),
    });
  } catch (e) {
    console.error("PATCH /api/brochures/[id] failed:", e);
    return NextResponse.json({ error: "Could not update brochure." }, { status: 500 });
  }
}
