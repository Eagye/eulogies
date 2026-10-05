"use client";

import { QRCodeCanvas } from "qrcode.react";
import BrochureShell from "@/components/brochure/BrochureShell";
import { brochurePublicUrl } from "@/lib/brochure/publicUrl";
import type { BrochureSection } from "@/types/brochure";

type PrintBrochureProps = {
  brochureId: string;
  name: string;
  dob?: string;
  dod?: string;
  bio?: string;
  sections?: BrochureSection[];
};

function formatDisplayDate(iso: string | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PrintBrochure({
  brochureId,
  name,
  dob,
  dod,
  bio,
  sections = [],
}: PrintBrochureProps) {
  const brochureUrl = brochurePublicUrl(brochureId);
  const dobLabel = formatDisplayDate(dob);
  const dodLabel = formatDisplayDate(dod);

  return (
    <BrochureShell className="bg-white text-black mx-auto border print:shadow-none">
      <div
        className="flex min-h-[297mm] flex-col p-10"
        style={{ width: "210mm" }}
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold mb-2">In Loving Memory</h1>
          <h2 className="text-2xl font-bold">{name || "—"}</h2>
          {(dobLabel || dodLabel) && (
            <p className="text-sm mt-2 text-gray-600">
              {dobLabel}
              {dobLabel && dodLabel ? " – " : ""}
              {dodLabel}
            </p>
          )}
        </div>

        {bio && (
          <div className="mb-8">
            <h3 className="font-semibold mb-2 text-lg">Biography</h3>
            <p className="text-sm leading-relaxed whitespace-pre-line">{bio}</p>
          </div>
        )}

        {sections.map((section) =>
          section.title.trim() || section.content.trim() ? (
            <div key={section.id} className="mb-8">
              {section.title.trim() && (
                <h3 className="font-semibold mb-2 text-lg">{section.title}</h3>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ) : null,
        )}

        <div className="mt-auto flex flex-col items-center pt-8">
          <p className="text-sm mb-3 text-center text-gray-600">
            Scan to view tributes, light candles, and share memories
          </p>
          <QRCodeCanvas value={brochureUrl} size={140} bgColor="#FFFFFF" fgColor="#000000" />
          <p className="text-xs mt-2 break-all text-center text-gray-500 max-w-xs">
            {brochureUrl}
          </p>
        </div>
      </div>
    </BrochureShell>
  );
}
