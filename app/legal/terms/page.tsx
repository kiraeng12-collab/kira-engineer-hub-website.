import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using Kira Engineer Hub websites, communities and educational content.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Use" lastUpdated="4 July 2026">
      <h2>1. Operator information</h2>
      <p>
        Kira Engineer Hub is the trading name used for the website, educational content, community access and
        related digital services. The formal legal entity, registration number, registered address and governing
        law are not yet published because the owner has not provided final registration details. Online checkout
        remains disabled until those fields are complete.
      </p>
      <h2>2. Acceptance</h2>
      <p>By using the website, joining official communities, requesting access, or using educational materials, you agree to these Terms and the policies linked from the Legal Center.</p>
      <h2>3. Eligibility and age</h2>
      <p>You must be at least 18 years old, or the higher age required where you live, and legally permitted to access trading education in your location.</p>
      <h2>4. Educational-service definition</h2>
      <p>
        Kira Engineer Hub provides trading education, financial-market education, risk discipline, market-analysis
        education, community learning, technology updates, and trading-related digital products. It is not a
        broker, investment manager, fund manager, copy-trading provider, engineering consultancy, or personalized
        financial-advisory business.
      </p>
      <h2>5. No personalized financial advice or brokerage</h2>
      <p>
        Content, scenarios, market commentary, tools, Telegram posts and membership discussion are general
        education and information. Kira Engineer Hub does not execute trades, hold customer funds, manage
        portfolios, choose trades for users, or provide individualized investment, tax, legal or financial advice.
      </p>
      <h2>6. User responsibility</h2>
      <p>You are responsible for your broker selection, platform use, leverage, position sizing, account security, tax obligations, legal compliance, and every trading decision you make.</p>
      <h2>7. Account and Telegram security</h2>
      <p>Keep your Telegram account, membership links and access instructions secure. Access is personal and must not be shared, resold, transferred or used by another person.</p>
      <h2>8. Acceptable use</h2>
      <ul>
        <li>Do not harass, threaten, impersonate, spam or mislead others.</li>
        <li>Do not solicit funds or claim to represent Kira Engineer Hub unless officially authorized.</li>
        <li>Do not publish fake results, guaranteed-profit claims or manipulated screenshots.</li>
        <li>Do not copy, scrape, record, redistribute or resell private content.</li>
      </ul>
      <h2>9. Intellectual property</h2>
      <p>Brand assets, written content, visuals, educational resources, membership materials, Project 242 concepts and website code remain protected. Permission is required before copying, republishing or commercial use.</p>
      <h2>10. Third-party platforms</h2>
      <p>Telegram, Instagram, hosting, payment and analytics providers operate under their own terms. Kira Engineer Hub is not responsible for third-party platform outages, account restrictions, security decisions or policy changes.</p>
      <h2>11. Availability, suspension and termination</h2>
      <p>Content, access methods and services may change. Access may be refused, paused or terminated for misuse, non-payment, chargeback abuse, redistribution, security risk or community-safety concerns.</p>
      <h2>12. No guarantee of results</h2>
      <p>No profit, win rate, market outcome, strategy result or trading performance is promised. Analysis can be wrong and markets can move unexpectedly.</p>
      <h2>13. Liability and disputes</h2>
      <p>
        To the maximum extent permitted by applicable law, Kira Engineer Hub is not liable for trading losses,
        platform failures, third-party actions, missed opportunities or user decisions. Disputes should first be
        raised through the contact route so they can be reviewed in good faith.
      </p>
      <h2>14. Governing law</h2>
      <p>Governing law and court jurisdiction will be published after final legal entity details are provided. Checkout remains disabled until the required legal fields are complete.</p>
      <h2>15. Contact</h2>
      <p>Contact: <a href="mailto:KE@kiraengineerhub.com">KE@kiraengineerhub.com</a>.</p>
    </LegalPageLayout>
  );
}
