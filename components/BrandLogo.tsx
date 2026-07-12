import Image from "next/image";
import { siteConfig } from "@/lib/config/site";

/**
 * The official Kira Engineer Hub wordmark (icon + company name + tagline,
 * provided by the owner as a single transparent lockup - never redrawn,
 * recoloured, or cropped here). Used exactly as provided in both header and
 * footer placements, sized via CSS/the `width`/`height` props only.
 */
export function BrandLogo({ context }: { context: "header" | "footer" }) {
  const width = context === "footer" ? 223 : 282;
  const height = context === "footer" ? 38 : 48;

  return (
    <Image
      className={context === "footer" ? "brand-mark-footer" : "brand-mark"}
      src="/kira-engineer-hub-wordmark.png"
      width={width}
      height={height}
      alt={`${siteConfig.companyName} - ${siteConfig.tagline}`}
      priority={context === "header"}
    />
  );
}
