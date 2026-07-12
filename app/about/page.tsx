import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RevealOnScroll } from "@/components/RevealOnScroll";

export const metadata: Metadata = {
  title: "About",
  description:
    "Kira Engineer Hub is a trading-education and financial-technology brand focused on structured learning, risk discipline, community, and technology development.",
  alternates: { canonical: "/about" },
};

/**
 * Visual brand story. Every statement here is verified copy that already
 * exists elsewhere on the site (previous About page, homepage About
 * section, Founder page) - reorganized into an editorial scroll experience,
 * not rewritten. "Structure before action." is the owner's own creative
 * theme from the KIRA Intelligence Network brief.
 */
const MILESTONES = [
  {
    label: "2021",
    title: "Community foundation",
    text: "The public community began from real market discussion and education.",
  },
  {
    label: "Now",
    title: "Education and membership",
    text: "The public community and KIRA VIP Membership create two clear access paths.",
  },
  {
    label: "Next",
    title: "Technology roadmap",
    text: "Project 242, KIRA Academy, and future tools will be released only when ready.",
  },
  {
    label: "Future",
    title: "Trading technology",
    text: "Trading technology tools, subject to readiness and review.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="section brand-story-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
          <p className="eyebrow">About Kira Engineer Hub</p>
          <h1>
            Structure before action.
          </h1>
          <p className="lead">
            Kira Engineer Hub applies structured, analytical thinking to trading education. The word Engineer
            reflects the founder&apos;s identity and a disciplined way of approaching markets, risk, learning, and
            technology.
          </p>
        </div>
      </section>

      <section className="section dark-section">
        <div className="container story">
          <div>
            <p className="eyebrow">Since 2021</p>
            <h2>Built from real community experience.</h2>
            <p className="lead">
              Kira Engineer Hub grew from years of market discussion, education, community management, and the
              practical challenges traders face when applying discipline under pressure.
            </p>
            <p className="muted">
              The company is not a broker, investment manager, account-management service, copy-trading provider, or
              provider of guaranteed financial returns.
            </p>
          </div>
          <div className="story-panel">
            <ul className="timeline brand-timeline">
              {MILESTONES.map((m) => (
                <RevealOnScroll as="li" key={m.label}>
                  <strong>{m.label}</strong>
                  <span>
                    <em>{m.title}.</em> {m.text}
                  </span>
                </RevealOnScroll>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container story">
          <div className="story-panel">
            <p className="eyebrow">Founder identity</p>
            <p>
              Kira Engineer Hub is built around a founder-led identity: structured thinking, disciplined market
              education, risk awareness, and carefully released technology. The brand avoids unsupported claims and
              focuses on process, learning, and long-term credibility.
            </p>
            <Link className="text-link" href="/founder">The Kira Engineer approach</Link>
          </div>
          <div>
            <p className="eyebrow">Deliberately transparent roadmap</p>
            <h2>Education and community first. Technology as it becomes ready.</h2>
            <p className="lead">
              The brand applies structured thinking to trading education, risk discipline, community, and financial
              technology - and releases products only when content, delivery, and protection are ready.
            </p>
            <div className="actions">
              <Link className="button cyan" href="/ecosystem">Discover the Ecosystem</Link>
              <Link className="button secondary" href="/community">Join Free Community</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
