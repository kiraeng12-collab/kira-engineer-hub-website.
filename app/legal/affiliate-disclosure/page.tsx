import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Affiliate and Conflicts Disclosure",
  description: "Affiliate and commercial relationship disclosure for Kira Engineer Hub.",
  alternates: { canonical: "/legal/affiliate-disclosure" },
};

export default function AffiliateDisclosurePage() {
  return (
    <LegalPageLayout title="Affiliate and Conflicts Disclosure" lastUpdated="4 July 2026">
      <p>Kira Engineer Hub may work with approved partners, affiliates or contributors. If a partner earns commission from a referral, the promotion must clearly disclose that commercial relationship near the promotion.</p>
      <h2>Disclosure example</h2>
      <div className="notice">Affiliate disclosure: I may earn a commission if you join Kira Engineer Hub through my link or code.</div>
      <h2>No change to risk</h2>
      <p>Affiliate relationships do not reduce trading risk and do not create guarantees. Users should review all terms, pricing, refund rules and risk disclosures before joining.</p>
    </LegalPageLayout>
  );
}
