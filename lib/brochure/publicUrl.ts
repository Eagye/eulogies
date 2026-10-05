/** Public memorial brochure URL for QR codes and sharing. */
export function brochurePublicUrl(brochureId: string, origin?: string): string {
  const base =
    origin?.replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://euloges.com";
  return `${base}/brochure/${brochureId}`;
}
