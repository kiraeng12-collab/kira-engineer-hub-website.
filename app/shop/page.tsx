import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Shop",
  description: "KIRA Shop is coming soon. Join the notify list to hear when it opens.",
  alternates: { canonical: "/shop" },
};

/**
 * The storefront behind the overlay is a deliberately blurred, non-functional
 * mock (aria-hidden, no pointer events): skeleton tiles with an abstract
 * placeholder mark and text/price bars. The art is intentionally generic - it
 * does not reveal what products the shop will carry - so nothing is disclosed
 * or can be mistaken for a live offer. All visible copy lives in the unblurred
 * Coming Soon panel and the notify form.
 */
const MOCK_TILE_COUNT = 8;

function TileArt() {
  // A neutral image-placeholder mark, identical on every tile, so no specific
  // merchandise type is implied.
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      <rect x="30" y="24" width="60" height="52" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
      <circle cx="48" cy="42" r="6" fill="var(--cyan)" opacity=".6" />
      <path d="M36 70 L54 52 L66 62 L78 48 L84 70 Z" fill="var(--border)" opacity=".8" />
    </svg>
  );
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
              {Array.from({ length: MOCK_TILE_COUNT }).map((_, i) => (
                <div className="shop-mock-tile" key={i}>
                  <div className="shop-mock-art"><TileArt /></div>
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
