/** Canonical share URL for a post (requires login to view in app). */
export function postShareUrl(postId: string, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "";
  return `${base}/posts/${postId}`;
}
