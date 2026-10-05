import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import DashboardFrame from "@/components/layout/DashboardFrame";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.email.toLowerCase() },
    select: { name: true, avatarUrl: true },
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardFrame
        viewerEmail={session.email}
        viewerName={user?.name ?? "You"}
        viewerAvatarUrl={user?.avatarUrl ?? null}
      >
        {children}
      </DashboardFrame>
    </div>
  );
}
