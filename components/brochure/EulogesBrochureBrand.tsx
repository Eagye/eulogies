import { Lock, Sparkles } from "lucide-react";

type EulogesBrochureBrandProps = {
  /** watermark = diagonal emboss; footer = attribution strip; full = both */
  variant?: "watermark" | "footer" | "full";
  className?: string;
  compact?: boolean;
};

export default function EulogesBrochureBrand({
  variant = "full",
  className = "",
  compact = false,
}: EulogesBrochureBrandProps) {
  const showWatermark = variant === "watermark" || variant === "full";
  const showFooter = variant === "footer" || variant === "full";

  return (
    <>
      {showWatermark && (
        <div
          aria-hidden
          className="euloges-brochure-watermark-layer pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span className="euloges-brochure-watermark">EULOGES</span>
        </div>
      )}

      {showFooter && (
        <footer
          className={`euloges-brochure-brand-footer ${compact ? "euloges-brochure-brand-footer--compact" : ""} ${className}`.trim()}
        >
          <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              <Sparkles className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
              Created by Euloges
            </span>
            {!compact && (
              <>
                <span className="hidden text-gray-300 sm:inline" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  <Lock className="h-3 w-3 shrink-0" aria-hidden />
                  Secure memorial hosting
                </span>
              </>
            )}
          </div>
          {!compact && (
            <p className="mt-1 text-center text-[10px] text-gray-400">
              Memorial brochures &amp; digital tributes · euloges.com
            </p>
          )}
        </footer>
      )}
    </>
  );
}
