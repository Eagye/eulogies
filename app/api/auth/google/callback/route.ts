import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  appOriginFromRequest,
  exchangeGoogleCode,
  fetchGoogleProfile,
  getGoogleCallbackUrl,
} from "@/lib/auth/google";
import { SESSION_COOKIE, signSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const STATE_COOKIE = "google_oauth_state";
const RETURN_COOKIE = "oauth_return";

function clearOAuthCookies(res: NextResponse) {
  res.cookies.set(STATE_COOKIE, "", { maxAge: 0, path: "/" });
  res.cookies.set(RETURN_COOKIE, "", { maxAge: 0, path: "/" });
}

export async function GET(request: Request) {
  const origin = appOriginFromRequest(request);
  const jar = await cookies();
  const returnTo = jar.get(RETURN_COOKIE)?.value === "signup" ? "/signup" : "/login";

  const url = new URL(request.url);
  const oauthError = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (oauthError === "access_denied") {
    const res = NextResponse.redirect(`${origin}${returnTo}?error=google_denied`);
    clearOAuthCookies(res);
    return res;
  }

  if (!code || !state) {
    const res = NextResponse.redirect(`${origin}${returnTo}?error=google_invalid`);
    clearOAuthCookies(res);
    return res;
  }

  const expected = jar.get(STATE_COOKIE)?.value;
  if (!expected || expected !== state) {
    const res = NextResponse.redirect(`${origin}${returnTo}?error=google_state`);
    clearOAuthCookies(res);
    return res;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    const res = NextResponse.redirect(`${origin}${returnTo}?error=google_config`);
    clearOAuthCookies(res);
    return res;
  }

  const redirectUri = getGoogleCallbackUrl(request);

  let accessToken: string;
  try {
    const tokens = await exchangeGoogleCode(
      code,
      redirectUri,
      clientId,
      clientSecret,
    );
    accessToken = tokens.access_token;
  } catch {
    const res = NextResponse.redirect(`${origin}${returnTo}?error=google_token`);
    clearOAuthCookies(res);
    return res;
  }

  let profile: Awaited<ReturnType<typeof fetchGoogleProfile>>;
  try {
    profile = await fetchGoogleProfile(accessToken);
  } catch {
    const res = NextResponse.redirect(`${origin}${returnTo}?error=google_profile`);
    clearOAuthCookies(res);
    return res;
  }

  if (profile.verified_email === false) {
    const res = NextResponse.redirect(`${origin}${returnTo}?error=google_unverified`);
    clearOAuthCookies(res);
    return res;
  }

  await prisma.user.upsert({
    where: { email: profile.email },
    create: {
      email: profile.email,
      name: profile.name,
      passwordHash: null,
    },
    update: {
      name: profile.name,
    },
  });

  const sessionToken = signSession(profile.email);
  if (!sessionToken) {
    const res = NextResponse.redirect(`${origin}${returnTo}?error=session`);
    clearOAuthCookies(res);
    return res;
  }

  const res = NextResponse.redirect(`${origin}/`);
  res.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  clearOAuthCookies(res);
  return res;
}
