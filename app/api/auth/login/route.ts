import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, signSession } from "@/lib/auth/session";
import { validateLoginInput } from "@/lib/auth/validateCredentials";
import { prisma } from "@/lib/db/prisma";

type LoginBody = { email?: string; password?: string };

async function verifyWithRemoteApi(
  baseUrl: string,
  email: string,
  password: string,
): Promise<boolean> {
  const url = `${baseUrl.replace(/\/$/, "")}/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.ok;
}

async function verifyWithDatabase(
  email: string,
  password: string,
): Promise<
  | { ok: true; sessionEmail: string }
  | { ok: false; sessionEmail: string; googleOnly?: true }
> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) return { ok: false, sessionEmail: email.toLowerCase() };
  if (!user.passwordHash) {
    return { ok: false, sessionEmail: user.email, googleOnly: true };
  }
  const ok = await verifyPassword(password, user.passwordHash);
  return ok
    ? { ok: true, sessionEmail: user.email }
    : { ok: false, sessionEmail: user.email };
}

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const inputError = validateLoginInput(email, password);
  if (inputError) {
    return NextResponse.json({ error: inputError }, { status: 400 });
  }

  const apiUrl = process.env.AUTH_API_URL?.trim();
  const devEmail = process.env.DEV_AUTH_EMAIL?.trim();
  const devPassword = process.env.DEV_AUTH_PASSWORD;
  const devMatches =
    !!devEmail &&
    devPassword !== undefined &&
    email.toLowerCase() === devEmail.toLowerCase() &&
    password === devPassword;

  let ok = false;
  let sessionEmail = email.toLowerCase();

  if (apiUrl) {
    try {
      ok = await verifyWithRemoteApi(apiUrl, email, password);
    } catch {
      return NextResponse.json(
        { error: "Could not reach the authentication service. Try again later." },
        { status: 502 },
      );
    }
  } else {
    try {
      const db = await verifyWithDatabase(email, password);
      if (!db.ok && "googleOnly" in db && db.googleOnly) {
        return NextResponse.json(
          {
            error:
              "This account uses Google. Use “Continue with Google” to sign in.",
          },
          { status: 401 },
        );
      }
      ok = db.ok;
      sessionEmail = db.sessionEmail;
    } catch (e) {
      console.error("[login] database", e);
      if (devMatches) {
        ok = true;
        sessionEmail = email.toLowerCase();
      } else {
        return NextResponse.json(
          {
            error:
              "Sign-in database is unavailable. Set DATABASE_URL and run npx prisma migrate dev, or set DEV_AUTH_EMAIL and DEV_AUTH_PASSWORD only for emergency access when the database is down.",
          },
          { status: 503 },
        );
      }
    }
  }

  if (!ok) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 },
    );
  }

  const token = signSession(sessionEmail);
  if (!token) {
    return NextResponse.json(
      { error: "Server configuration error (missing AUTH_SECRET in production)." },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true, email: sessionEmail });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
