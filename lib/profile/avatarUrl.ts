const AVATAR_PATH = /^\/uploads\/avatars\/[a-zA-Z0-9._-]+$/;

export function isValidAvatarUrl(url: unknown): url is string {
  return typeof url === "string" && AVATAR_PATH.test(url);
}
