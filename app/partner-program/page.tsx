import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "KIRA Partner Program",
  description: "Partner interest page for approved Kira Engineer Hub referral partners.",
  alternates: { canonical: "/partner-program" },
};

export default function PartnerProgramPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }, { label: "Partner Program" }]} />
        <h1>KIRA Partner Program</h1>
        <p className="meta">Last updated: 4 July 2026</p>
      </div>
      <div className="doc-body">
        <section>
          <h2>Partner with a risk-aware trading education brand.</h2>
          <p>
            The KIRA Partner Program is invite-only or manually approved. Suitable partners may refer audiences to
            Kira Engineer Hub while following clear promotion, disclosure and compliance rules.
          </p>
          <div className="notice">
            <strong>Required disclosure:</strong> Every affiliate promotion must clearly state that the partner may
            earn a commission if someone joins through their link or code.
          </div>
        </section>
        <section>
          <h2>Commercial model</h2>
          <p>
            Initial commission is 20% of eligible collected KIRA VIP Membership revenue during the referred
            customer&apos;s first 90 days, subject to approval, validation, refunds, chargebacks and program rules.
          </p>
        </section>
        <section>
          <h2>Rules and restrictions</h2>
          <ul>
            <li>Approval is required before promotion.</li>
            <li>Referral attribution uses approved links or codes with a 30-day attribution window.</li>
            <li>Payouts are monthly after a 30-day validation period and a USD 50 minimum payout.</li>
            <li>Refunds, failed payments and chargebacks reverse commission eligibility.</li>
            <li>Partners are responsible for tax obligations.</li>
            <li>Paid ads, brand-keyword bidding and use of Kira intellectual property require approval.</li>
            <li>No profit guarantees, fake results, misleading urgency, spam, impersonation or unauthorized discounts.</li>
            <li>Confidential information must remain confidential.</li>
          </ul>
        </section>
        <section>
          <h2>Apply</h2>
          <form className="form-panel" action="/api/forms" method="post" data-enhanced-form>
            <input type="hidden" name="form_type" value="partner" />
            <label className="visually-hidden">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <div className="grid">
              <p><label>Full name<input name="full_name" required /></label></p>
              <p><label>Email<input type="email" name="email" required /></label></p>
              <p><label>Telegram username<input name="telegram_username" /></label></p>
              <p><label>Country<input name="country" /></label></p>
              <p><label>Website or social profile<input name="profile" required /></label></p>
              <p><label>Approximate audience size<input name="audience_size" /></label></p>
            </div>
            <p><label>Audience description<textarea name="audience_description" required /></label></p>
            <p><label>Main promotional channels<textarea name="channels" /></label></p>
            <p>
              <label>
                <input type="checkbox" required /> I agree to avoid misleading financial claims and follow the
                Partner Program Terms.
              </label>
            </p>
            <p>
              <label>
                <input type="checkbox" required /> I consent to Kira Engineer Hub reviewing this application and
                contacting me about it.
              </label>
            </p>
            <button className="button" type="submit">Send Application</button>
            <p className="form-note" data-form-status aria-live="polite" />
          </form>
        </section>
      </div>
    </div>
  );
}
