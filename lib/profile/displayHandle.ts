/** @handle-style label from email (e.g. jane.doe@x.com → @janedoe). */
export function displayHandle(email: string): string {
  const local = email.split("@")[0] ?? "user";
  const slug = local
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20);
  return `@${slug || "member"}`;
}
