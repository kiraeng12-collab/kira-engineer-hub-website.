import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Kira Engineer Hub for community, membership, partnership, support, and professional enquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        <p className="eyebrow">Contact</p>
        <h1>Contact Kira Engineer Hub.</h1>
        <p className="meta">Use official channels only for membership, support, partnership, and professional enquiries.</p>
      </div>
      <div className="doc-body">
        <section className="cards">
          <article className="card">
            <h2>Email</h2>
            <p><a href={`mailto:${siteConfig.contact.general}`}>{siteConfig.contact.general}</a></p>
          </article>
          <article className="card">
            <h2>Telegram Community</h2>
            <p><a href={siteConfig.social.telegramCommunity}>Join the free community</a></p>
          </article>
          <article className="card">
            <h2>Membership Contact</h2>
            <p><a href={siteConfig.social.telegramMembershipSupport}>Request membership access</a></p>
          </article>
          <article className="card">
            <h2>Instagram</h2>
            <p>
              <a href={siteConfig.social.instagramFounder}>@kira.engineer</a>
              <br />
              <a href={siteConfig.social.instagramTrading}>@kira.tradingc</a>
            </p>
          </article>
        </section>

        <section>
          <h2>Send an enquiry</h2>
          <form className="form-panel" action="/api/forms" method="post" data-enhanced-form>
            <input type="hidden" name="form_type" value="contact" />
            <label className="visually-hidden">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <div className="grid">
              <p><label>Full name<input name="full_name" required /></label></p>
              <p><label>Email<input type="email" name="email" required /></label></p>
              <p><label>Telegram username<input name="telegram_username" placeholder="@username" /></label></p>
              <p>
                <label>
                  Topic
                  <select name="topic" required>
                    <option>Membership</option>
                    <option>Free community</option>
                    <option>Partnership</option>
                    <option>Careers</option>
                    <option>Project 242</option>
                    <option>Website or legal</option>
                    <option>Other</option>
                  </select>
                </label>
              </p>
            </div>
            <p><label>Message<textarea name="message" required /></label></p>
            <p>
              <label>
                <input type="checkbox" required /> I understand Kira Engineer Hub provides educational information
                only and does not provide personalized financial advice.
              </label>
            </p>
            <button className="button" type="submit">Send Enquiry</button>
            <p className="form-note" data-form-status aria-live="polite" />
          </form>
        </section>

        <div className="risk-warning">
          <strong>Safety note</strong>
          Kira Engineer Hub does not request card details through social media messages and does not guarantee
          trading outcomes.
        </div>
      </div>
    </div>
  );
}
