import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Preferences" };

export default function AccountPreferencesPage() {
  return (
    <div>
      <h1>Preferences</h1>
      <p className="meta">Manage cookie choices and privacy requests.</p>
      <section>
        <h2>Cookies</h2>
        <p>Manage which non-essential cookies are allowed on this site.</p>
        <button className="button secondary" type="button" data-cookie-settings>Cookie Settings</button>
      </section>
      <section>
        <h2>Privacy</h2>
        <p>Request access to, correction of, or deletion of your personal data.</p>
        <Link className="text-link" href="/privacy-request">Submit a Privacy Request</Link>
      </section>
    </div>
  );
}
