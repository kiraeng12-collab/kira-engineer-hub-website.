import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Complaints Procedure",
  description: "Submit a complaint to Kira Engineer Hub.",
  alternates: { canonical: "/complaints" },
};

export default function ComplaintsPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }, { label: "Complaints" }]} />
        <h1>Complaints Procedure</h1>
        <p className="meta">Last updated: 4 July 2026</p>
      </div>
      <div className="doc-body">
        <p>Complaints can be submitted about website content, membership access, community conduct, billing issues or privacy handling. Include enough information for review.</p>
        <form className="form-panel" action="/api/forms" method="post" data-enhanced-form>
          <input type="hidden" name="form_type" value="complaint" />
          <label className="visually-hidden">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <div className="grid">
            <p><label>Name<input name="name" required /></label></p>
            <p><label>Email<input type="email" name="email" required /></label></p>
            <p><label>Telegram username<input name="telegram_username" /></label></p>
            <p>
              <label>
                Complaint category
                <select name="category" required>
                  <option>Membership access</option>
                  <option>Billing or refund</option>
                  <option>Community conduct</option>
                  <option>Privacy</option>
                  <option>Website content</option>
                  <option>Other</option>
                </select>
              </label>
            </p>
          </div>
          <p><label>Complaint details<textarea name="details" required /></label></p>
          <p>
            <label>
              <input type="checkbox" required /> I confirm the information is accurate to the best of my knowledge.
            </label>
          </p>
          <button className="button" type="submit">Send Complaint</button>
          <p className="form-note" data-form-status aria-live="polite" />
        </form>
        <h2>Review process</h2>
        <p>Kira Engineer Hub aims to acknowledge complaints within 7 business days where practical and provide a response within 30 business days where practical. Complex matters may require more time.</p>
      </div>
    </div>
  );
}
