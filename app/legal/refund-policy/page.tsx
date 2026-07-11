import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy",
  description: "Cancellation and refund policy for KIRA VIP Membership and Kira Engineer Hub services.",
  alternates: { canonical: "/legal/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund and Cancellation Policy" lastUpdated="4 July 2026">
      <h2>How to cancel</h2>
      <p>
        Until online checkout is activated, cancellation or access-removal requests should be sent to{" "}
        <a href="mailto:KE@kiraengineerhub.com">KE@kiraengineerhub.com</a> or the official membership support
        Telegram. When a billing portal is added, members should use the billing portal for subscription
        cancellation and payment-method updates.
      </p>
      <h2>Cancellation deadline</h2>
      <p>Cancellation should be requested before the next renewal date. When recurring billing is activated, the billing portal or checkout provider will control the exact renewal timing.</p>
      <h2>Access after cancellation</h2>
      <p>Unless required by law or removed for policy breach, access may continue until the end of the paid period. Cancellation stops future renewal; it does not automatically create a refund for time already provided.</p>
      <h2>Refund eligibility</h2>
      <p>Refund requests are reviewed for duplicate charges, technical billing errors, confirmed failure to deliver paid access after reasonable support review, material misdescription, or mandatory consumer rights that apply in the user&apos;s location.</p>
      <h2>Non-refundable situations</h2>
      <ul>
        <li>Trading losses, market movement, non-use of the membership, disagreement with educational views, or a change of mind after access has been delivered are not automatic refund reasons.</li>
        <li>Redistribution, abuse, chargeback misuse, fraud or community-rule violations may make a refund unavailable unless applicable law requires otherwise.</li>
      </ul>
      <h2>Duplicate charges and billing errors</h2>
      <p>Duplicate charges and clear billing errors should be reported as soon as possible with the payment reference, email, Telegram username and relevant evidence.</p>
      <h2>Processing time and method</h2>
      <p>Approved refunds are normally returned to the original payment method where possible. Payment-provider processing times may vary and are not fully controlled by Kira Engineer Hub.</p>
      <h2>Chargebacks</h2>
      <p>Members are encouraged to contact support before filing a chargeback. Chargebacks may cause temporary access suspension while the payment provider reviews the case.</p>
      <h2>Mandatory rights</h2>
      <p>Nothing in this policy limits consumer rights that cannot lawfully be excluded.</p>
    </LegalPageLayout>
  );
}
