import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Early Bird Lifetime Discount Eligibility",
  description: "Early Bird verification journey and discount terms for KIRA VIP Membership.",
  alternates: { canonical: "/early-bird" },
};

export default function EarlyBirdPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }, { label: "Early Bird" }]} />
        <h1>Early Bird Lifetime Discount Eligibility</h1>
        <p className="meta">Last updated: 4 July 2026</p>
      </div>
      <div className="doc-body">
        <p>
          Early Bird Lifetime Discount Eligibility is a verification benefit for members who joined qualifying
          official Kira spaces before 1 August 2026 at 12:00 AM Gulf Standard Time.
        </p>
        <h2>Customer journey</h2>
        <ul>
          <li>Submit an eligibility request.</li>
          <li>Kira reviews available records.</li>
          <li>Additional evidence may be requested.</li>
          <li>The applicant receives an approval or rejection result.</li>
          <li>Approved members receive private instructions.</li>
        </ul>
        <h2>Discount terms</h2>
        <p>
          The current Early Bird benefit is a 20% percentage-based discount on qualifying KIRA VIP Membership
          prices: USD 56 per month or USD 151.20 every three months. Eligibility may remain available for the
          verified member&apos;s lifetime, but it does not provide lifetime free access and requires an active paid
          subscription.
        </p>
        <h2>Evidence</h2>
        <p>
          Evidence may include Telegram identifiers, historical community records, prior payment records, approved
          screenshots, or other records Kira can reasonably verify.
        </p>
        <h2>Limits</h2>
        <p>
          The benefit is personal, non-transferable, not for resale, not normally combinable with other promotions,
          and excludes Project 242 and other products unless officially extended.
        </p>
        <h2>Following cancellation</h2>
        <p>
          If a verified member cancels and later returns, eligibility may be reviewed against the same verified
          member record if the qualifying service remains available.
        </p>
        <form className="form-panel" action="/api/forms" method="post" data-enhanced-form>
          <input type="hidden" name="form_type" value="early_bird" />
          <label className="visually-hidden">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <div className="grid">
            <p><label>Name<input name="name" required /></label></p>
            <p><label>Email<input type="email" name="email" required /></label></p>
            <p><label>Telegram username<input name="telegram_username" required /></label></p>
            <p><label>Estimated join date<input name="estimated_join_date" /></label></p>
          </div>
          <p><label>Evidence or notes<textarea name="details" required /></label></p>
          <p>
            <label>
              <input type="checkbox" required /> I understand approval is not automatic and may require review of
              available records.
            </label>
          </p>
          <button className="button" type="submit">Send Eligibility Request</button>
          <p className="form-note" data-form-status aria-live="polite" />
        </form>
      </div>
    </div>
  );
}
