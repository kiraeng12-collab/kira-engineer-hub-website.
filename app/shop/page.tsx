import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Shop",
  description: "KIRA Shop is coming soon. Join the notify list to hear when it opens.",
  alternates: { canonical: "/shop" },
};

/**
 * The storefront behind the overlay is a deliberately blurred, non-functional
 * mock (aria-hidden, no pointer events): skeleton product tiles with generic
 * merchandise silhouettes and text/price bars - no real products, prices, or
 * buy actions exist, so nothing can be mistaken for a live offer. All real
 * information lives in the unblurred Coming Soon panel and the notify form.
 */
const MOCK_TILES: { variant: "tee" | "hoodie" | "cap" | "sticker" | "mug" | "notebook"; wide?: boolean }[] = [
  { variant: "tee" },
  { variant: "sticker" },
  { variant: "hoodie" },
  { variant: "mug" },
  { variant: "cap" },
  { variant: "notebook" },
  { variant: "sticker" },
  { variant: "tee" },
];

function TileArt({ variant }: { variant: (typeof MOCK_TILES)[number]["variant"] }) {
  switch (variant) {
    case "tee":
      return (
        <svg viewBox="0 0 120 100" aria-hidden="true">
          <path d="M38 22 L54 14 Q60 20 66 14 L82 22 L94 40 L82 48 L82 86 L38 86 L38 48 L26 40 Z" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
          <rect x="52" y="44" width="16" height="10" rx="2" fill="var(--cyan)" opacity=".8" />
        </svg>
      );
    case "hoodie":
      return (
        <svg viewBox="0 0 120 100" aria-hidden="true">
          <path d="M38 26 L52 16 Q60 30 68 16 L82 26 L94 44 L82 52 L82 88 L38 88 L38 52 L26 44 Z" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
          <path d="M50 16 Q60 6 70 16 Q60 26 50 16" fill="none" stroke="var(--border)" strokeWidth="2" />
          <line x1="56" y1="52" x2="56" y2="64" stroke="var(--cyan)" strokeWidth="2" />
          <line x1="64" y1="52" x2="64" y2="64" stroke="var(--cyan)" strokeWidth="2" />
        </svg>
      );
    case "cap":
      return (
        <svg viewBox="0 0 120 100" aria-hidden="true">
          <path d="M34 58 Q34 30 60 30 Q86 30 86 58 Z" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
          <path d="M34 58 L98 58 Q100 66 90 66 L36 64 Z" fill="var(--cyan)" opacity=".55" />
        </svg>
      );
    case "sticker":
      return (
        <svg viewBox="0 0 120 100" aria-hidden="true">
          <circle cx="60" cy="50" r="30" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
          <circle cx="60" cy="50" r="16" fill="none" stroke="var(--cyan)" strokeWidth="3" />
        </svg>
      );
    case "mug":
      return (
        <svg viewBox="0 0 120 100" aria-hidden="true">
          <rect x="38" y="30" width="40" height="44" rx="5" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
          <path d="M78 40 Q94 40 94 52 Q94 64 78 64" fill="none" stroke="var(--border)" strokeWidth="2" />
          <rect x="46" y="44" width="24" height="8" rx="2" fill="var(--cyan)" opacity=".7" />
        </svg>
      );
    case "notebook":
      return (
        <svg viewBox="0 0 120 100" aria-hidden="true">
          <rect x="40" y="22" width="44" height="58" rx="4" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
          <line x1="48" y1="22" x2="48" y2="80" stroke="var(--border)" strokeWidth="2" />
          <rect x="56" y="34" width="20" height="6" rx="2" fill="var(--cyan)" opacity=".7" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ShopPage() {
  return (
    <div className="section">
      <div className="container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

        <div className="shop-preview">
          <div className="shop-mock" aria-hidden="true">
            <div className="shop-mock-bar">
              <span className="shop-mock-brand" />
              <span className="shop-mock-search" />
              <span className="shop-mock-cart" />
            </div>
            <div className="shop-mock-chips">
              {[64, 88, 72, 96, 58].map((w, i) => (
                <span key={i} style={{ width: w }} />
              ))}
            </div>
            <div className="shop-mock-grid">
              {MOCK_TILES.map((tile, i) => (
                <div className="shop-mock-tile" key={i}>
                  <div className="shop-mock-art"><TileArt variant={tile.variant} /></div>
                  <span className="shop-mock-line" style={{ width: "82%" }} />
                  <span className="shop-mock-line" style={{ width: "58%" }} />
                  <div className="shop-mock-foot">
                    <span className="shop-mock-price" />
                    <span className="shop-mock-btn" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="shop-overlay">
            <div className="shop-overlay-panel">
              <p className="eyebrow">KIRA Shop</p>
              <h1>Coming Soon.</h1>
              <p>The official KIRA brand shop is on its way.</p>
              <a className="button cyan" href="#notify">Get Notified</a>
            </div>
          </div>
        </div>

        <section id="notify" className="shop-notify">
          <h2>Get notified</h2>
          <form className="form-panel" action="/api/forms" method="post" data-enhanced-form>
            <input type="hidden" name="form_type" value="shop_interest" />
            <label className="visually-hidden">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <div className="grid">
              <p><label>Full name<input name="full_name" required /></label></p>
              <p><label>Email<input type="email" name="email" required /></label></p>
              <p><label>Telegram username<input name="telegram_username" /></label></p>
            </div>
            <p><label>Message<textarea name="message" required /></label></p>
            <p>
              <label>
                <input type="checkbox" required /> I understand the shop is not open yet and this is not a purchase.
              </label>
            </p>
            <button className="button" type="submit">Send Interest</button>
            <p className="form-note" data-form-status aria-live="polite" />
          </form>
        </section>
      </div>
    </div>
  );
}
