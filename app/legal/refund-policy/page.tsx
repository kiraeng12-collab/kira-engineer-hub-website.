import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy",
  description: "Cancellation and refund policy for KIRA VIP Membership and Kira Engineer Hub services.",
  alternates: { canonical: "/legal/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund and Cancellation Policy" lastUpdated="25 July 2026">
      <h2>How to cancel</h2>
      <p>
        Until online checkout is activated, cancellation or access-removal requests should be sent to{" "}
        <a href="mailto:support@ke-hub.com">support@ke-hub.com</a> or the official membership support
        Telegram. When a billing portal is added, members should use the billing portal for subscription
        cancellation and payment-method updates.
      </p>
      <h2>Cancellation deadline</h2>
      <p>Cancellation should be requested before the next renewal date. When recurring billing is activated, the billing portal or checkout provider will control the exact renewal timing.</p>
      <h2>Access after cancellation</h2>
      <p>Unless required by law or removed for policy breach, access may continue until the end of the paid period. Cancellation stops future renewal; it does not automatically create a refund for time already provided.</p>
      <h2>Refund eligibility</h2>
      <p>
        KIRA VIP Membership gives immediate access to educational content and a private Telegram space as soon as
        payment is taken, so purchases are final. A refund is issued only when:
      </p>
      <ul>
        <li>a payment was <strong>duplicated</strong> or charged in error (for example, charged twice, or charged after a cancellation that had already taken effect); or</li>
        <li>there was a <strong>genuine billing or technical error on our side</strong>, including being charged for access that was never delivered and cannot be resolved through support.</li>
      </ul>
      <p>
        These issues must be reported to us <strong>immediately</strong> after the charge, with the payment reference,
        email, and Telegram username, so we can verify and correct them promptly. Outside these situations, and except
        where mandatory consumer law provides otherwise, payments are non-refundable.
      </p>
      <h2>Non-refundable situations</h2>
      <ul>
        <li>A <strong>change of mind</strong> after access has been delivered &mdash; including requests made hours or days after subscribing.</li>
        <li>Not using the membership, disagreement with educational views, or trading losses and market movement.</li>
        <li>Cancelling partway through a paid period (cancellation stops future renewals; it does not refund the current period).</li>
        <li>Redistribution, abuse, chargeback misuse, fraud, or community-rule violations, unless applicable law requires otherwise.</li>
      </ul>
      <h2>Processing time and method</h2>
      <p>Approved refunds are normally returned to the original payment method where possible. Payment-provider processing times may vary and are not fully controlled by Kira Engineer Hub.</p>
      <h2>Chargebacks</h2>
      <p>Members are encouraged to contact support before filing a chargeback. Chargebacks may cause temporary access suspension while the payment provider reviews the case.</p>
      <h2>Mandatory rights</h2>
      <p>Nothing in this policy limits consumer rights that cannot lawfully be excluded.</p>
    </LegalPageLayout>
  );
}
