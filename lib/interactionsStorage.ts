import { MemorialInteractions } from "@/types/interactions";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadInteractions(brochureId: string): MemorialInteractions {
  if (!canUseStorage()) {
    return { candles: [], messages: [] };
  }

  const raw = localStorage.getItem(`euloges_interactions_${brochureId}`);
  if (!raw) {
    return { candles: [], messages: [] };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return { candles: [], messages: [] };
  }
}

export function saveInteractions(
  brochureId: string,
  data: MemorialInteractions,
) {
  if (!canUseStorage()) return;
  localStorage.setItem(
    `euloges_interactions_${brochureId}`,
    JSON.stringify(data),
  );
}
