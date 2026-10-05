const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v2/userinfo";

export function getGoogleCallbackUrl(request: Request): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return `${explicit}/api/auth/google/callback`;
  const u = new URL(request.url);
  return `${u.protocol}//${u.host}/api/auth/google/callback`;
}

export function getGoogleAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const u = new URL(GOOGLE_AUTH);
  u.searchParams.set("client_id", params.clientId);
  u.searchParams.set("redirect_uri", params.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "openid email profile");
  u.searchParams.set("state", params.state);
  u.searchParams.set("prompt", "select_account");
  u.searchParams.set("access_type", "offline");
  return u.toString();
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string,
): Promise<{ access_token: string }> {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("[google token]", res.status, t);
    throw new Error("token_exchange_failed");
  }
  return res.json() as Promise<{ access_token: string }>;
}

export async function fetchGoogleProfile(accessToken: string): Promise<{
  email: string;
  name: string;
  verified_email?: boolean;
}> {
  const res = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("userinfo_failed");
  const data = (await res.json()) as {
    email?: string;
    name?: string;
    verified_email?: boolean;
  };
  if (!data.email) throw new Error("no_email");
  return {
    email: data.email.trim().toLowerCase(),
    name: (data.name ?? data.email.split("@")[0] ?? "User").trim() || "User",
    verified_email: data.verified_email,
  };
}

export function appOriginFromRequest(request: Request): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const u = new URL(request.url);
  return `${u.protocol}//${u.host}`;
}
