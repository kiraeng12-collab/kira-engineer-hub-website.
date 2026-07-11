import type { Metadata } from "next";
import Script from "next/script";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Kira Engineer Hub, KIRA VIP Membership, Project 242, Early Bird benefits, refunds and affiliates.",
  alternates: { canonical: "/faq" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Kira Engineer Hub?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kira Engineer Hub is a trading education, risk-discipline, community-access and financial-technology brand.",
      },
    },
    {
      "@type": "Question",
      name: "Is Kira Engineer Hub a broker?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Kira Engineer Hub does not execute trades, hold customer funds or manage portfolios.",
      },
    },
    {
      "@type": "Question",
      name: "Is the content financial advice?",
      acceptedAnswer: { "@type": "Answer", text: "No. Content is educational and general information only." },
    },
  ],
};

export default function FaqPage() {
  return (
    <div className="doc-page">
      <Script
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
        <h1>Frequently Asked Questions</h1>
        <p className="meta">Last updated: July 2026</p>
      </div>
      <div className="doc-body">
        <details>
          <summary>What is Kira Engineer Hub?</summary>
          <p>Kira Engineer Hub is a trading education, risk-discipline, community-access and financial-technology brand.</p>
        </details>
        <details>
          <summary>Is Kira Engineer Hub a broker?</summary>
          <p>No. Kira Engineer Hub does not execute trades, hold customer funds or manage portfolios.</p>
        </details>
        <details>
          <summary>Is the content financial advice?</summary>
          <p>No. Website content, community posts, scenarios and membership discussions are educational and general information only.</p>
        </details>
        <details>
          <summary>What is included in the KIRA VIP Membership?</summary>
          <p>Private educational discussion, market context, planning resources, community support and Telegram-dependent access.</p>
        </details>
        <details>
          <summary>How is access delivered?</summary>
          <p>Access is currently coordinated through Telegram and may depend on Telegram account availability and platform rules.</p>
        </details>
        <details>
          <summary>What markets are discussed?</summary>
          <p>Market education may refer to forex, crypto, indices, commodities, stocks or other markets, but discussion is not personalized advice.</p>
        </details>
        <details>
          <summary>Are profits guaranteed?</summary>
          <p>No. Trading involves risk and no result, profit, win rate or outcome is guaranteed.</p>
        </details>
        <details>
          <summary>What is Project 242?</summary>
          <p>Project 242 is a proprietary risk-management initiative currently in development. Additional details will be released only when its product, protection and delivery framework are ready.</p>
        </details>
        <details>
          <summary>Is Project 242 available now?</summary>
          <p>No. Project 242 is not currently available for purchase, and public details remain limited until it is ready for release.</p>
        </details>
        <details>
          <summary>How does the Early Bird benefit work?</summary>
          <p>Eligible verified members who joined before 1 August 2026 may receive a personal discount on qualifying KIRA VIP Membership plans. Eligibility must be verified against Kira records.</p>
        </details>
        <details>
          <summary>Can membership access be shared?</summary>
          <p>No. Access is personal and may not be shared, resold, redistributed or reposted.</p>
        </details>
        <details>
          <summary>How do cancellations work?</summary>
          <p>Cancellation stops future renewal when processed under the available support or billing method. See the Refund and Cancellation Policy.</p>
        </details>
        <details>
          <summary>How do refunds work?</summary>
          <p>Refunds are reviewed under the Refund and Cancellation Policy. Duplicate payments, technical billing errors and exceptional cases may be reviewed.</p>
        </details>
        <details>
          <summary>How can I contact support?</summary>
          <p>Use Telegram or email <a href="mailto:KE@kiraengineerhub.com">KE@kiraengineerhub.com</a>.</p>
        </details>
        <details>
          <summary>How does the affiliate program work?</summary>
          <p>The KIRA Partner Program is invite-only or manually approved and may pay approved partners for eligible referred membership revenue.</p>
        </details>
        <details>
          <summary>Does Kira Engineer Hub hold or manage customer funds?</summary>
          <p>No. Membership payment is for educational and community access. Users make their own trading decisions.</p>
        </details>
      </div>
    </div>
  );
}
