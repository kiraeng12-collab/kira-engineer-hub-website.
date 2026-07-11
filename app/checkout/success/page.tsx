import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Checkout Complete",
  robots: { index: false, follow: false },
  alternates: { canonical: "/checkout/success" },
};

export default function CheckoutSuccessPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Checkout Complete" }]} />
        <p className="eyebrow">Payment</p>
        <h1>Checkout completed.</h1>
      </div>
      <div className="doc-body">
        <div className="notice">
          <strong>Thank you.</strong>
          <br />
          Your payment was received. Your membership will be confirmed automatically once Stripe verifies the
          subscription - this usually takes a few moments, and can take a little longer in some cases.
        </div>
        <div className="actions">
          <Link className="button" href="/account/membership">View Membership Status</Link>
          <Link className="button secondary" href="/support">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
