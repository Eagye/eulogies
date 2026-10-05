import type { ReactNode } from "react";
import EulogesBrochureBrand from "@/components/brochure/EulogesBrochureBrand";

type BrochureShellProps = {
  children: ReactNode;
  className?: string;
  showWatermark?: boolean;
  showFooter?: boolean;
  compactBrand?: boolean;
};

/** Wraps brochure content with embossed Euloges watermark and footer attribution. */
export default function BrochureShell({
  children,
  className = "",
  showWatermark = true,
  showFooter = true,
  compactBrand = false,
}: BrochureShellProps) {
  return (
    <div className={`euloges-brochure-shell relative overflow-hidden ${className}`.trim()}>
      {showWatermark && <EulogesBrochureBrand variant="watermark" />}
      <div className="relative z-[1]">{children}</div>
      {showFooter && (
        <EulogesBrochureBrand variant="footer" compact={compactBrand} />
      )}
    </div>
  );
}
