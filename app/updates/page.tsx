import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "Official Kira Engineer Hub updates about membership, Early Bird pricing, platform development, Project 242, and education releases.",
  alternates: { canonical: "/updates" },
};

export default function UpdatesPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Updates" }]} />
        <p className="eyebrow">Official Updates</p>
        <h1>Company and platform updates.</h1>
      </div>
      <div className="doc-body">
        <section className="cards">
          <article className="card">
            <span className="pill">1 August 2026</span>
            <h2>Membership and payment experience launch</h2>
            <p>A new KIRA membership and payment experience is scheduled for 1 August 2026. Verified eligible members retain loyalty pricing where eligibility is approved.</p>
            <Link className="button secondary" href="/early-bird">Early Bird Eligibility</Link>
          </article>
          <article className="card">
            <span className="pill">Current</span>
            <h2>KIRA VIP pricing</h2>
            <p>KIRA VIP Monthly is USD 70 per month. KIRA VIP Quarterly is USD 189 every three months.</p>
            <Link className="button secondary" href="/membership">View Membership</Link>
          </article>
          <article className="card">
            <span className="pill">In Development</span>
            <h2>Project 242</h2>
            <p>Project 242 remains private while development continues. Additional public details will be released only when ready.</p>
            <Link className="button secondary" href="/project-242">Project 242</Link>
          </article>
        </section>
      </div>
    </div>
  );
}
