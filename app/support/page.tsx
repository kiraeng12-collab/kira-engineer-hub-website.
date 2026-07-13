import type { Metadata } from "next";
import Link from "next/link";
import { ActionLink } from "@/components/ActionLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Support",
  description: "Support information for Kira Engineer Hub community, membership, Early Bird eligibility, privacy, and complaints.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Support" }]} />
        <p className="eyebrow">Support</p>
        <h1>Support and help.</h1>
      </div>
      <div className="doc-body">
        <section className="cards">
          <article className="card">
            <h2>Membership</h2>
            <p>For access and renewal questions, use the support form or official Telegram.</p>
            <ActionLink className="button secondary" href={siteConfig.social.telegramMembershipSupport}>Telegram Support</ActionLink>
          </article>
          <article className="card">
            <h2>Early Bird</h2>
            <p>Submit eligibility information through the Early Bird page.</p>
            <Link className="button secondary" href="/early-bird">Early Bird Page</Link>
          </article>
          <article className="card">
            <h2>Privacy</h2>
            <p>Use the privacy request page for data-related requests.</p>
            <Link className="button secondary" href="/privacy-request">Privacy Request</Link>
          </article>
          <article className="card">
            <h2>Complaints</h2>
            <p>Review the complaints process before submitting a formal issue.</p>
            <Link className="button secondary" href="/legal/complaints">Complaints Policy</Link>
          </article>
        </section>

        <section>
          <h2>Open a support request</h2>
          <form className="form-panel" action="/api/forms" method="post" data-enhanced-form>
            <input type="hidden" name="form_type" value="support" />
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
                  Support category
                  <select name="category" required>
                    <option>Membership access</option>
                    <option>Billing preparation</option>
                    <option>Early Bird eligibility</option>
                    <option>Telegram access</option>
                    <option>Website issue</option>
                    <option>Other</option>
                  </select>
                </label>
              </p>
            </div>
            <p><label>Request details<textarea name="message" required /></label></p>
            <p>
              <label>
                <input type="checkbox" required /> I confirm this request does not include card numbers, passwords,
                seed phrases, or broker login details.
              </label>
            </p>
            <button className="button" type="submit">Send Support Request</button>
            <p className="form-note" data-form-status aria-live="polite" />
          </form>
        </section>
      </div>
    </div>
  );
}
