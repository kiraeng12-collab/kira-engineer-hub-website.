import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Kira Trading Community",
  description:
    "Join Kira Trading Community, the free public Telegram community from Kira Engineer Hub for educational market updates and community discussion.",
  alternates: { canonical: "/community" },
};

export default function CommunityPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Community" }]} />
        <p className="eyebrow">Free Community</p>
        <h1>Kira Trading Community.</h1>
        <p className="meta">A free public Telegram channel for educational market updates, general insights, and official community announcements.</p>
      </div>
      <div className="doc-body">
        <div className="hero-panel">
          <h2>What to expect</h2>
          <ul>
            <li>Educational market context and public updates.</li>
            <li>Community announcements from Kira Engineer Hub.</li>
            <li>General learning material without personalized financial advice.</li>
            <li>Clear pathways toward KIRA VIP Membership when private access is needed.</li>
          </ul>
          <div className="actions">
            <Link className="button" href={siteConfig.social.telegramCommunity}>Join Free Community</Link>
            <Link className="button secondary" href="/community-rules">Read Community Rules</Link>
          </div>
        </div>
        <div className="risk-warning">
          <strong>No advice or guarantees</strong>
          Community content is educational only and does not guarantee profit, accuracy, or trading outcomes.
        </div>
      </div>
    </div>
  );
}
