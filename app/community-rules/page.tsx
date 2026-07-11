import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Community Rules",
  description: "Community rules for Kira Trading Community, KIRA VIP Channel and KIRA VIP Group.",
  alternates: { canonical: "/community-rules" },
};

export default function CommunityRulesPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal" }, { label: "Community Rules" }]} />
        <h1>Community Rules</h1>
        <p className="meta">Last updated: 4 July 2026</p>
      </div>
      <div className="doc-body">
        <article>
          <p>These rules apply across Kira Trading Community, KIRA VIP Channel, KIRA VIP Group and any other official Kira Engineer Hub community space.</p>
          <h2>Respectful communication</h2>
          <p>Harassment, discrimination, personal attacks, intimidation and abusive language are not allowed.</p>
          <h2>Relevant and responsible discussion</h2>
          <p>Keep discussion relevant, clear and risk-aware. Do not present personal opinions as guaranteed outcomes.</p>
          <h2>No spam or unauthorized promotion</h2>
          <p>Spam, unsolicited promotion, unauthorized affiliate links, broker promotion without approval, impersonation and financial solicitation are not allowed.</p>
          <h2>Private content protection</h2>
          <p>Members must not record, screenshot for redistribution, copy, resell, repost or move private content into competing paid communities or public channels.</p>
          <h2>No misleading claims</h2>
          <p>Do not post false performance claims, guaranteed-profit claims, manipulated screenshots, fake results or claims that Kira manages funds.</p>
          <h2>Security and funds</h2>
          <p>Do not request or accept funds on behalf of Kira unless through an official approved channel. Do not share passwords, API keys or private account data.</p>
          <h2>Enforcement</h2>
          <p>Moderators may warn, restrict, pause or remove members depending on severity. Serious conduct may result in immediate removal.</p>
          <h2>Appeals and reporting</h2>
          <p>Reports or appeals can be sent to <a href="mailto:KE@kiraengineerhub.com">KE@kiraengineerhub.com</a> with relevant context and evidence.</p>
        </article>
      </div>
    </div>
  );
}
