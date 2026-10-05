import type { ReactNode } from "react";

export default function ProfileShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-visible rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      {children}
    </div>
  );
}
