import { redirect } from "next/navigation";
import SignupForm from "@/components/auth/SignupForm";
import { getSession } from "@/lib/auth/session";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  const { error } = await searchParams;
  return <SignupForm oauthErrorCode={error} />;
}
