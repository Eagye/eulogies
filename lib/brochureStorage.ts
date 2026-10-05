import { BrochureDraft } from "@/types/brochure";

const STORAGE_KEY = "euloges_brochure_draft";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function saveBrochureDraft(draft: BrochureDraft) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function loadBrochureDraft(): BrochureDraft | null {
  if (!canUseStorage()) return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as BrochureDraft;
  } catch {
    return null;
  }
}

export function clearBrochureDraft() {
  if (!canUseStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}
