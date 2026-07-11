import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "About",
  description:
    "Kira Engineer Hub is a trading-education and financial-technology brand focused on structured learning, risk discipline, community, and technology development.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
        <p className="eyebrow">About</p>
        <h1>Kira Engineer Hub.</h1>
        <p className="meta">Trading education, risk discipline, community experience, and financial technology development.</p>
      </div>
      <div className="doc-body">
        <div className="hero-panel">
          <h2>What the brand stands for</h2>
          <p>
            Kira Engineer Hub applies structured, analytical thinking to trading education. The word Engineer
            reflects the founder&apos;s identity and a disciplined way of approaching markets, risk, learning, and
            technology.
          </p>
          <p>The company is not a broker, investment manager, account-management service, copy-trading provider, or provider of guaranteed financial returns.</p>
        </div>
        <section className="cards">
          <article className="card">
            <span className="pill">2021</span>
            <h2>Community foundation</h2>
            <p>The public community began from real market discussion and education.</p>
          </article>
          <article className="card">
            <span className="pill">Now</span>
            <h2>Education and membership</h2>
            <p>The public community and KIRA VIP Membership create two clear access paths.</p>
          </article>
          <article className="card">
            <span className="pill">Next</span>
            <h2>Technology roadmap</h2>
            <p>Project 242, KIRA Academy, and future tools will be released only when ready.</p>
          </article>
        </section>
      </div>
    </div>
  );
}
