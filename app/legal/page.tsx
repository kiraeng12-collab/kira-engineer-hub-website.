import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Legal Center",
  description: "Policies, disclosures, terms, and support routes for Kira Engineer Hub.",
  alternates: { canonical: "/legal" },
};

const documents = [
  { href: "/legal/terms", title: "Terms of Use", description: "Rules for using the website, content, communities, and services." },
  { href: "/legal/membership-terms", title: "Membership Terms", description: "KIRA VIP Membership access, billing, conduct, Early Bird eligibility, and exclusions." },
  { href: "/legal/risk-disclosure", title: "Risk Disclosure", description: "Important trading, leverage, volatility, execution, and educational-limit risks." },
  { href: "/legal/refund-policy", title: "Refund and Cancellation Policy", description: "Cancellation, access after cancellation, billing errors, duplicate charges, and refund review." },
  { href: "/legal/privacy", title: "Privacy Policy", description: "How website, contact, Telegram, membership, payment, and analytics information may be handled." },
  { href: "/legal/cookie-policy", title: "Cookie Policy", description: "Cookie categories, consent choices, and actual deployed cookie use." },
  { href: "/legal/complaints", title: "Complaints Procedure", description: "How to raise a complaint and what information to include." },
  { href: "/legal/affiliate-terms", title: "Partner Program Terms", description: "Approval, attribution, commissions, prohibited advertising, disclosures, and termination." },
  { href: "/legal/affiliate-disclosure", title: "Affiliate and Conflicts Disclosure", description: "How commercial relationships and partner compensation must be disclosed." },
  { href: "/community-rules", title: "Community Rules", description: "Rules for free and private Telegram spaces, content protection, moderation, and appeals." },
  { href: "/legal/regulatory-notice", title: "Regulatory Notice", description: "Boundaries around education, market commentary, technology, and user responsibility." },
  { href: "/legal/accessibility", title: "Accessibility Statement", description: "Accessibility goals, feedback contact, and current support route." },
  { href: "/legal/project-242-terms", title: "Project 242 Terms", description: "Limited public terms for the in-development Project 242 initiative." },
];

export default function LegalCenterPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal" }]} />
        <h1>Legal Center</h1>
        <p className="meta">Last updated: 4 July 2026</p>
      </div>
      <div className="doc-body">
        <p>
          This Legal Center brings together the policies, disclosures, rules, and terms that apply when using Kira
          Engineer Hub websites, communities, educational content, KIRA VIP Membership, and future products.
        </p>
        <div className="doc-grid">
          {documents.map((doc) => (
            <Link key={doc.href} className="doc-card" href={doc.href}>
              <strong>{doc.title}</strong>
              <p>{doc.description}</p>
              <span>Last updated: 4 July 2026</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
