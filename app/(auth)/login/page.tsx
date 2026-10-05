import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { getSession } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  const { registered, error } = await searchParams;
  return (
    <LoginForm
      justRegistered={registered === "1"}
      oauthErrorCode={error}
    />
  );
}
