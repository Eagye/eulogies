"use client";

import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import BrochureShell from "@/components/brochure/BrochureShell";
import { brochurePublicUrl } from "@/lib/brochure/publicUrl";

type BrochurePreviewProps = {
  brochureId: string;
  name: string;
  published?: boolean;
};

export default function BrochurePreview({
  brochureId,
  name,
  published = false,
}: BrochurePreviewProps) {
  const brochureUrl = brochurePublicUrl(brochureId);

  return (
    <BrochureShell
      className="rounded-xl border border-gray-200/80 bg-gray-50/80 p-6"
      compactBrand
    >
      <h2 className="text-lg font-semibold text-center">
        In Loving Memory of {name || "…"}
      </h2>

      <p className="mt-2 text-sm text-gray-600 text-center">
        {published
          ? "Your brochure is live. Share the link or print with the embossed Euloges mark."
          : "Publish to get a shareable link and QR code for your printed brochure."}
      </p>

      {published && (
        <>
          <div className="mt-4 flex justify-center">
            <QRCodeCanvas
              value={brochureUrl}
              size={160}
              bgColor="#FFFFFF"
              fgColor="#2F2F2F"
            />
          </div>

          <p className="mt-3 text-xs text-center text-gray-500 break-all">{brochureUrl}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              href={`/brochure/${brochureId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
            >
              View memorial
            </Link>
            <Link
              href={`/create-brochure/print?id=${brochureId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Print brochure
            </Link>
          </div>
        </>
      )}
    </BrochureShell>
  );
}
