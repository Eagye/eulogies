export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_denied: "Google sign-in was cancelled.",
  google_invalid: "Google sign-in failed. Please try again.",
  google_state: "Sign-in expired. Please try again.",
  google_token: "Could not complete Google sign-in.",
  google_profile: "Could not read your Google profile.",
  google_unverified: "Your Google email must be verified to continue.",
  google_config:
    "Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local.",
  session: "Could not start your session. Try again.",
};

export function oauthErrorMessage(code: string | undefined): string | null {
  if (!code) return null;
  return OAUTH_ERROR_MESSAGES[code] ?? "Something went wrong with Google sign-in.";
}
