import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Project242Visual } from "@/components/Project242Visual";

export const metadata: Metadata = {
  title: "Project 242",
  description:
    "Project 242 is a proprietary risk-management initiative being developed to help traders apply structured decision controls before, during and after a trade.",
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
        <Project242Visual />
        <div className="hero-panel">
          <h2>A risk-management initiative</h2>
          <p>
            Project 242 is a proprietary risk-management initiative being developed to help traders apply structured
            decision controls before, during and after a trade.
          </p>
          <p>Built to protect traders from the decisions they make under pressure.</p>
          <div className="actions">
            <Link className="button" href="/updates">Follow Official Updates</Link>
            <Link className="button secondary" href="/legal/project-242-terms">Project 242 Terms</Link>
          </div>
        </div>
        <section>
          <h2>What we can say publicly</h2>
          <ul>
            <li>It addresses a real problem: trading decisions made under pressure, without a structured process.</li>
            <li>It is grounded in risk discipline and behavioural decision-making, not prediction.</li>
            <li>It is currently in development. There is no release date yet.</li>
            <li>It is not a signal service and does not tell anyone what to trade.</li>
            <li>It cannot and does not guarantee results.</li>
            <li>Its features may change before release.</li>
          </ul>
          <p>The detailed internal methodology, scoring logic, and operational framework remain protected and are not shared publicly.</p>
        </section>
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
