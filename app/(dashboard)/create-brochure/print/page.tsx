"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import PrintBrochure from "@/components/brochure/PrintBrochure";
import { parseJsonResponse } from "@/lib/api/parseJsonResponse";
import type { BrochureDraft } from "@/types/brochure";

function PrintBrochureContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [brochure, setBrochure] = useState<BrochureDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No brochure id provided.");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/brochures/${id}`, { cache: "no-store" });
        const data = await parseJsonResponse<{
          brochure?: BrochureDraft;
          error?: string;
        }>(res);
        if (!res.ok || !data.brochure) {
          throw new Error(data.error ?? "Could not load brochure.");
        }
        if (!cancelled) setBrochure(data.brochure);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load brochure.");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 p-8">
        {error}
      </div>
    );
  }

  if (!brochure) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="bg-gray-200 p-10 min-h-screen print:bg-white print:p-0">
      <div className="mb-4 flex justify-center gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Print
        </button>
      </div>
      <PrintBrochure
        brochureId={brochure.id}
        name={brochure.name}
        dob={brochure.dob}
        dod={brochure.dod}
        bio={brochure.bio}
        sections={brochure.sections}
      />
    </div>
  );
}

export default function PrintBrochurePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Loading…
        </div>
      }
    >
      <PrintBrochureContent />
    </Suspense>
  );
}
