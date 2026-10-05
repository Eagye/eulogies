import type { BrochureSection } from "@/types/brochure";

export function parseBrochureSections(value: unknown): BrochureSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (s): s is BrochureSection =>
        typeof s === "object" &&
        s !== null &&
        typeof (s as BrochureSection).id === "string" &&
        typeof (s as BrochureSection).title === "string" &&
        typeof (s as BrochureSection).content === "string",
    )
    .map((s) => ({
      id: s.id,
      title: s.title,
      content: s.content,
    }));
}

export function validateSectionsInput(sections: unknown): BrochureSection[] | null {
  if (!Array.isArray(sections)) return null;
  const parsed = parseBrochureSections(sections);
  if (parsed.length !== sections.length) return null;
  return parsed;
}
