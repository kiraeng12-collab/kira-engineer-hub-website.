import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Educational insights from Kira Engineer Hub covering trading education, risk discipline, market structure, and technology updates.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Insights" }]} />
        <p className="eyebrow">Insights</p>
        <h1>Educational notes and platform updates.</h1>
        <p className="meta">A public archive for trading education, risk discipline, and Kira Engineer Hub development notes.</p>
      </div>
      <div className="doc-body">
        <section className="cards">
          <article className="card">
            <span className="pill">Launch</span>
            <h2>1 August 2026 membership update</h2>
            <p>The new KIRA membership and payment experience is being prepared with Early Bird loyalty pricing preserved for verified eligible members.</p>
            <Link className="button secondary" href="/updates">Read Updates</Link>
          </article>
          <article className="card">
            <span className="pill">Education</span>
            <h2>Risk-first learning</h2>
            <p>Future educational articles will focus on process, planning, review, and responsible market participation.</p>
          </article>
          <article className="card">
            <span className="pill">Archive</span>
            <h2>Weekly analysis</h2>
            <p>Weekly analysis content will be published only when reports are ready for public release.</p>
            <Link className="button secondary" href="/weekly-analysis">Open Archive</Link>
          </article>
        </section>
      </div>
    </div>
  );
}
