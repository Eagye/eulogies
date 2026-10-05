import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="py-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Euloges
        </h1>
        <p className="text-sm text-gray-500">
          Honoring lives. Preserving memories.
        </p>
      </header>

      {/* Page Content */}
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Euloges. All rights reserved.
      </footer>
    </div>
  );
}
