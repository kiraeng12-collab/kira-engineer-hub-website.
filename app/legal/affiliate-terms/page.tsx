import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Partner Program Terms",
  description: "Terms for Kira Engineer Hub approved partners and affiliates.",
  alternates: { canonical: "/legal/affiliate-terms" },
};

export default function AffiliateTermsPage() {
  return (
    <LegalPageLayout title="Partner Program Terms" lastUpdated="4 July 2026">
      <h2>Approval</h2>
      <p>Participation requires manual approval. Kira Engineer Hub may approve, refuse, suspend or terminate partner participation at its discretion.</p>
      <h2>Attribution and commission</h2>
      <p>Referral attribution uses approved links or codes. The attribution window is 30 days. Initial commission is 20% of eligible collected KIRA VIP Membership revenue during the referred customer&apos;s first 90 days, subject to validation.</p>
      <h2>Validation, payouts and reversals</h2>
      <p>Payouts are monthly after a 30-day validation period and a USD 50 minimum payout. Failed payments, refunds, chargebacks, fraud, self-referrals and reassigned existing members are not eligible and may reverse commissions.</p>
      <h2>Payment method and taxes</h2>
      <p>Payment method is agreed with the approved partner. Partners are responsible for tax reporting, invoices and local compliance.</p>
      <h2>Promotion rules</h2>
      <ul>
        <li>No guaranteed-profit, low-risk or fake performance claims.</li>
        <li>No spam, misleading urgency, unauthorized discounts or impersonation.</li>
        <li>Paid ads require approval. Brand-keyword bidding is restricted.</li>
        <li>Use of logos, screenshots and brand assets requires permission.</li>
        <li>Every affiliate promotion must clearly disclose the commercial relationship.</li>
      </ul>
      <h2>Confidentiality and termination</h2>
      <p>Private program information must remain confidential. After termination, unpaid commission is reviewed according to validation status, refund risk and program compliance.</p>
    </LegalPageLayout>
  );
}
