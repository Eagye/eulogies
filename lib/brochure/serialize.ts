import type { Brochure, BrochurePrivacy } from "@prisma/client";
import type { BrochureDraft } from "@/types/brochure";
import { parseBrochureSections } from "@/lib/brochure/sections";

export type SerializedBrochure = BrochureDraft & {
  creatorId?: string;
};

export function brochureToDraft(
  brochure: Brochure,
  options?: { includeAccessCode?: boolean; includeCreatorId?: boolean },
): SerializedBrochure {
  const draft: SerializedBrochure = {
    id: brochure.id,
    name: brochure.deceasedName,
    dob: brochure.dateOfBirth ?? "",
    dod: brochure.dateOfDeath ?? "",
    bio: brochure.bio,
    sections: parseBrochureSections(brochure.sections),
    privacy: brochure.privacy as "public" | "family",
    updatedAt: brochure.updatedAt.toISOString(),
  };

  if (options?.includeAccessCode && brochure.accessCode) {
    draft.accessCode = brochure.accessCode;
  }

  if (options?.includeCreatorId) {
    draft.creatorId = brochure.creatorId;
  }

  return draft;
}

export function draftToBrochureData(draft: {
  name: string;
  dob?: string;
  dod?: string;
  bio?: string;
  sections: BrochureDraft["sections"];
  privacy: "public" | "family";
  accessCode?: string;
}): {
  deceasedName: string;
  dateOfBirth: string | null;
  dateOfDeath: string | null;
  bio: string;
  sections: BrochureDraft["sections"];
  privacy: BrochurePrivacy;
  accessCode: string | null;
} {
  return {
    deceasedName: draft.name.trim(),
    dateOfBirth: draft.dob?.trim() || null,
    dateOfDeath: draft.dod?.trim() || null,
    bio: draft.bio?.trim() ?? "",
    sections: draft.sections,
    privacy: draft.privacy,
    accessCode:
      draft.privacy === "family" && draft.accessCode?.trim()
        ? draft.accessCode.trim()
        : null,
  };
}
