import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "KIRA Academy",
  description:
    "KIRA Academy is the coming education platform for structured courses and trader-development programmes from Kira Engineer Hub.",
  alternates: { canonical: "/academy" },
};

const learningTracks = [
  { name: "Beginner Education", description: "Foundations for traders starting from zero: markets, terminology, and how to learn safely." },
  { name: "Risk Management", description: "Position sizing, exposure control, and capital protection as a discipline, not an afterthought." },
  { name: "Market Structure", description: "Reading price behaviour, key levels, and changing conditions through a structured process." },
  { name: "Trading Psychology", description: "Decision-making under pressure, and building a review process instead of chasing outcomes." },
  { name: "Technology Tools", description: "Dashboards, tracking, and future decision-support tools that support - not replace - judgement." },
];

export default function AcademyPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Academy" }]} />
        <p className="eyebrow">Coming Soon</p>
        <h1>KIRA Academy.</h1>
        <p className="meta">Structured educational courses and trader-development programmes are being prepared for future release.</p>
      </div>
      <div className="doc-body">
        <div className="hero-panel">
          <h2>Education release principle</h2>
          <p>
            KIRA Academy content will be published only when learning structure, delivery quality, legal boundaries,
            and support resources are ready. No course is presented as a shortcut to guaranteed trading results.
          </p>
          <div className="actions">
            <Link className="button" href="/updates">Follow Updates</Link>
            <Link className="button secondary" href="/community">Join Free Community</Link>
          </div>
        </div>

        <section>
          <h2>Who it will be for</h2>
          <ul>
            <li>Traders who want structured, sequenced learning rather than scattered content.</li>
            <li>Members who want to build a repeatable process, not memorize predictions.</li>
            <li>Anyone who has read the free community content and wants a deeper, structured path.</li>
          </ul>
        </section>

        <section>
          <h2>Planned learning tracks</h2>
          <p className="small-disclosure">
            These are the subject areas currently planned, in early development. Specific modules, lesson counts,
            and release order are not finalized.
          </p>
          <div className="cards">
            {learningTracks.map((track) => (
              <article className="card" key={track.name}>
                <span className="pill">Planned</span>
                <h3>{track.name}</h3>
                <p>{track.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2>Learning outcomes</h2>
          <p>KIRA Academy is being built around the same method already used across Kira Engineer Hub:</p>
          <ul>
            <li>Understand market context before forming a view.</li>
            <li>Define scenarios with clear invalidation instead of predicting a single outcome.</li>
            <li>Control risk and exposure before entry, every time.</li>
            <li>Review decisions against the plan, not just the result.</li>
          </ul>
        </section>

        <section>
          <h2>Instructor</h2>
          <p>
            KIRA Academy content is developed under the same founder-led identity behind Kira Engineer Hub -
            structured thinking, disciplined market education, and a deliberately transparent development roadmap.
          </p>
          <Link className="text-link" href="/founder">Read about the founder</Link>
        </section>

        <section>
          <h2>Format &amp; access</h2>
          <div className="tblwrap">
            <table>
              <tbody>
                <tr><th scope="row">Delivery format</th><td>To be announced</td></tr>
                <tr><th scope="row">Estimated duration</th><td>To be announced</td></tr>
                <tr><th scope="row">Access period</th><td>To be announced</td></tr>
                <tr><th scope="row">Pricing</th><td>To be announced - will be published before any enrolment opens</td></tr>
                <tr><th scope="row">Included in KIRA VIP Membership?</th><td>No, unless a separate official offer states otherwise</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>Register interest</h2>
          <form className="form-panel" action="/api/forms" method="post" data-enhanced-form>
            <input type="hidden" name="form_type" value="academy_interest" />
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
                  Learning interest
                  <select name="interest" required>
                    <option>Beginner education</option>
                    <option>Risk management</option>
                    <option>Market structure</option>
                    <option>Trading psychology</option>
                    <option>Technology tools</option>
                  </select>
                </label>
              </p>
            </div>
            <p><label>What would you like KIRA Academy to cover?<textarea name="message" required /></label></p>
            <p>
              <label>
                <input type="checkbox" required /> I understand this is an interest request and not a course purchase.
              </label>
            </p>
            <button className="button" type="submit">Send Interest</button>
            <p className="form-note" data-form-status aria-live="polite" />
          </form>
        </section>

        <div className="risk-warning">
          <strong>Educational content only</strong>
          KIRA Academy will provide education and general information only. It will not provide personalized
          financial advice, investment management, or guaranteed trading results.
        </div>
      </div>
    </div>
  );
}
