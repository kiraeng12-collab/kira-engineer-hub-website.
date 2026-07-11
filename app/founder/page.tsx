import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Founder",
  description:
    "Learn about the founder-led identity behind Kira Engineer Hub and the structured approach represented by the Kira Engineer brand.",
  alternates: { canonical: "/founder" },
};

export default function FounderPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Founder" }]} />
        <p className="eyebrow">Founder Identity</p>
        <h1>The Kira Engineer approach.</h1>
      </div>
      <div className="doc-body">
        <div className="hero-panel">
          <p>
            Kira Engineer Hub is built around a founder-led identity: structured thinking, disciplined market
            education, risk awareness, and carefully released technology. The brand avoids unsupported claims and
            focuses on process, learning, and long-term credibility.
          </p>
          <p>Project 242 is part of this longer mission, but its detailed methodology remains private while development continues.</p>
          <div className="actions">
            <Link className="button" href="/about">About the Company</Link>
            <Link className="button secondary" href="/project-242">Project 242</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
