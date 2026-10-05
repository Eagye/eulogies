import { Suspense } from "react";
import DashboardHome from "@/components/feed/DashboardHome";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[600px] space-y-3 px-3">
          <div className="h-12 animate-pulse rounded-xl bg-white/80" />
          <div className="h-40 animate-pulse rounded-xl bg-white shadow-sm" />
          <div className="h-40 animate-pulse rounded-xl bg-white shadow-sm" />
        </div>
      }
    >
      <DashboardHome />
    </Suspense>
  );
}
