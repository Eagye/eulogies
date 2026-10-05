import { NextResponse } from "next/server";
import {
  appOriginFromRequest,
  getGoogleAuthUrl,
  getGoogleCallbackUrl,
} from "@/lib/auth/google";

const STATE_COOKIE = "google_oauth_state";
const RETURN_COOKIE = "oauth_return";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const origin = appOriginFromRequest(request);
  const from =
    new URL(request.url).searchParams.get("from") === "signup"
      ? "signup"
      : "login";

  if (!clientId || !clientSecret) {
    const path = from === "signup" ? "/signup" : "/login";
    return NextResponse.redirect(`${origin}${path}?error=google_config`);
  }

  const state = crypto.randomUUID();
  const redirectUri = getGoogleCallbackUrl(request);
  const authUrl = getGoogleAuthUrl({ clientId, redirectUri, state });

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  res.cookies.set(RETURN_COOKIE, from, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return res;
}
