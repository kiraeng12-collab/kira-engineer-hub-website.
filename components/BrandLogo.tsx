import { siteConfig } from "@/lib/config/site";

/**
 * The single official Kira Engineer Hub mark (geometric "K" + candlestick
 * bar, defined once in IconSprite as #ke-market-mark). Never redrawn here -
 * this component only controls which surrounding text/classes accompany it
 * for a given placement, per the Section 21 logo-usage system.
 */
export function BrandLogo({ context }: { context: "header" | "footer" }) {
  if (context === "footer") {
    return (
      <>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <use href="#ke-market-mark" />
        </svg>
        <span>{siteConfig.companyName}</span>
      </>
    );
  }

  return (
    <>
      <svg className="brand-mark" viewBox="0 0 100 100" aria-hidden="true">
        <use href="#ke-market-mark" />
      </svg>
      <span className="brand-text">
        {siteConfig.companyName}
        <small>{siteConfig.tagline}</small>
      </span>
    </>
  );
}
