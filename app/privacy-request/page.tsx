import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Request",
  description: "Submit a privacy rights request to Kira Engineer Hub.",
  alternates: { canonical: "/privacy-request" },
};

export default function PrivacyRequestPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }, { label: "Privacy Request" }]} />
        <h1>Privacy Request</h1>
        <p className="meta">Last updated: 4 July 2026</p>
      </div>
      <div className="doc-body">
        <p>
          Use this form to request access, correction, deletion, marketing opt-out, consent withdrawal or another
          privacy action. Verification may be required before action is taken.
        </p>
        <form className="form-panel" action="/api/forms" method="post" data-enhanced-form>
          <input type="hidden" name="form_type" value="privacy_request" />
          <label className="visually-hidden">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <div className="grid">
            <p><label>Name<input name="name" required /></label></p>
            <p><label>Email<input type="email" name="email" required /></label></p>
          </div>
          <p>
            <label>
              Request type
              <select name="request_type" required>
                <option>Access</option>
                <option>Correction</option>
                <option>Deletion</option>
                <option>Marketing opt-out</option>
                <option>Consent withdrawal</option>
                <option>Account closure</option>
                <option>Other privacy concern</option>
              </select>
            </label>
          </p>
          <p><label>Details<textarea name="details" required /></label></p>
          <p>
            <label>
              <input type="checkbox" required /> I understand Kira Engineer Hub may need reasonable verification
              before acting on this request.
            </label>
          </p>
          <button className="button" type="submit">Send Privacy Request</button>
          <p className="form-note" data-form-status aria-live="polite" />
        </form>
      </div>
    </div>
  );
}
