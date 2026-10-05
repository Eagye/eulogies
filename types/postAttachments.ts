export type PostAttachment = {
  type: "image" | "video";
  url: string;
};

const UPLOAD_PATH = /^\/uploads\/posts\/[a-zA-Z0-9._-]+$/;

export function isPostAttachment(v: unknown): v is PostAttachment {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    (o.type === "image" || o.type === "video") &&
    typeof o.url === "string" &&
    UPLOAD_PATH.test(o.url)
  );
}

export function parseAttachments(raw: unknown): PostAttachment[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.filter(isPostAttachment);
}

/** Validates client-submitted attachment list (strict URLs). */
export function validateAttachmentsInput(raw: unknown): PostAttachment[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) return null;
  if (raw.length > 10) return null;
  const out: PostAttachment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const o = item as Record<string, unknown>;
    const type = o.type;
    const url = o.url;
    if (type !== "image" && type !== "video") return null;
    if (typeof url !== "string" || !UPLOAD_PATH.test(url)) return null;
    out.push({ type, url });
  }
  return out;
}
