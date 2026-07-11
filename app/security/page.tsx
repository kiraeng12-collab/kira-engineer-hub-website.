import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Security information for Kira Engineer Hub, including responsible contact and current production safety boundaries.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Security" }]} />
        <p className="eyebrow">Security</p>
        <h1>Security and responsible contact.</h1>
      </div>
      <div className="doc-body">
        <div className="hero-panel">
          <p>
            Kira Engineer Hub uses HTTPS, security headers, cookie consent controls, and a public security contact.
            Checkout remains disabled until payment, account, and membership infrastructure are production-ready.
          </p>
          <p>Security contact: <a href="mailto:KE@kiraengineerhub.com">KE@kiraengineerhub.com</a></p>
          <p>Security policy: <a href="/.well-known/security.txt">/.well-known/security.txt</a></p>
        </div>
        <section>
          <h2>Report a vulnerability</h2>
          <p>
            If you believe you have found a security vulnerability affecting Kira Engineer Hub, please report it
            responsibly using the form below instead of disclosing it publicly. Do not include passwords, API keys,
            or other account credentials in your report.
          </p>
          <form className="form-panel" action="/api/forms" method="post" data-enhanced-form>
            <input type="hidden" name="form_type" value="security_report" />
            <label className="visually-hidden">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <div className="grid">
              <p><label>Full name<input name="full_name" required /></label></p>
              <p><label>Email<input type="email" name="email" required /></label></p>
              <p>
                <label>
                  Severity (your assessment)
                  <select name="severity" required>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </label>
              </p>
              <p><label>Affected page or system<input name="affected_area" /></label></p>
            </div>
            <p><label>Description and steps to reproduce<textarea name="details" required /></label></p>
            <p>
              <label>
                <input type="checkbox" required /> I confirm this report does not include passwords, API keys, or
                other credentials, and I will not publicly disclose this issue before it is resolved.
              </label>
            </p>
            <button className="button" type="submit">Send Security Report</button>
            <p className="form-note" data-form-status aria-live="polite" />
          </form>
        </section>
      </div>
    </div>
  );
}
