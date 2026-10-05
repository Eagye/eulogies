import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { validateSignupInput } from "@/lib/auth/validateCredentials";
import { prisma } from "@/lib/db/prisma";

type SignupBody = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name : "";
  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const email = emailRaw.toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!confirmPassword || confirmPassword !== password) {
    return NextResponse.json(
      { error: "Password confirmation does not match." },
      { status: 400 },
    );
  }

  const inputError = validateSignupInput(name, emailRaw, password);
  if (inputError) {
    return NextResponse.json({ error: inputError }, { status: 400 });
  }

  try {
    const passwordHash = await hashPassword(password);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name.trim(),
      },
    });
  } catch (e: unknown) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    console.error("[signup]", e);
    return NextResponse.json(
      {
        error:
          "Could not create your account. Check that DATABASE_URL is set and run: npx prisma migrate dev",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
