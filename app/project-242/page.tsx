import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Project 242",
  description: "A private Kira Engineer initiative. Public details remain intentionally limited while development continues.",
  alternates: { canonical: "/project-242" },
};

export default function Project242Page() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Project 242" }]} />
        <p className="eyebrow">In Development</p>
        <h1>Project 242.</h1>
        <p className="meta">A private Kira Engineer initiative. Public details remain intentionally limited while development continues.</p>
      </div>
      <div className="doc-body">
        <div className="hero-panel">
          <h2>In development</h2>
          <p>Project 242 is currently in development. There is no release date yet, and no public details are available at this stage.</p>
          <div className="actions">
            <Link className="button" href="/updates">Follow Official Updates</Link>
            <Link className="button secondary" href="/legal/project-242-terms">Project 242 Terms</Link>
          </div>
        </div>
        <section>
          <h2>Join the waitlist</h2>
          <form className="form-panel" action="/api/forms" method="post" data-enhanced-form>
            <input type="hidden" name="form_type" value="project_242_interest" />
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
                  Interest type
                  <select name="interest" required>
                    <option>Product updates</option>
                    <option>Beta-testing interest</option>
                    <option>Educational updates</option>
                  </select>
                </label>
              </p>
            </div>
            <p><label>Message<textarea name="message" required /></label></p>
            <p>
              <label>
                <input type="checkbox" required /> I understand Project 242 is not publicly available, is not a
                signal service, cannot guarantee results, and internal methodology will not be shared.
              </label>
            </p>
            <button className="button" type="submit">Send Interest</button>
            <p className="form-note" data-form-status aria-live="polite" />
          </form>
        </section>
        <div className="risk-warning">
          <strong>No public offer</strong>
          Project 242 is not currently available for purchase and should not be interpreted as financial advice,
          investment management, or a promise of results.
        </div>
      </div>
    </div>
  );
}
