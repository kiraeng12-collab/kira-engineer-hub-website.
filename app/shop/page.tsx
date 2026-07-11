import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "KIRA Shop is coming soon. Future official brand merchandise including apparel, stickers, accessories, and selected community items will appear when checkout and delivery are ready.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
        <p className="eyebrow">Coming Soon</p>
        <h1>KIRA Shop is coming soon.</h1>
        <p className="meta">
          The future KIRA brand shop will feature official merchandise such as apparel, laptop stickers, desk items,
          and selected community collectibles once checkout, delivery, and support are ready.
        </p>
      </div>
      <div className="doc-body">
        <section className="cards">
          <article className="card">
            <span className="pill">Coming Soon</span>
            <h2>Brand apparel</h2>
            <p>Future releases may include KIRA shirts, hoodies, caps, and selected wearable brand items.</p>
          </article>
          <article className="card">
            <span className="pill">Coming Soon</span>
            <h2>Stickers and desk items</h2>
            <p>Laptop stickers, desk accessories, and visual identity items will be prepared for the community brand shop.</p>
          </article>
          <article className="card">
            <span className="pill">Under Construction</span>
            <h2>Secure checkout</h2>
            <p>Online payment remains disabled until merchandise checkout, shipping, refund workflow, and customer support are fully prepared.</p>
          </article>
        </section>
        <section>
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
              <p>
                <label>
                  Interest
                  <select name="interest" required>
                    <option>Apparel</option>
                    <option>Laptop stickers</option>
                    <option>Desk accessories</option>
                    <option>Limited brand items</option>
                  </select>
                </label>
              </p>
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
