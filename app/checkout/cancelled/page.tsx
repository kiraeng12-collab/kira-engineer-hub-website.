import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  robots: { index: false, follow: false },
  alternates: { canonical: "/checkout/cancelled" },
};

export default function CheckoutCancelledPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Checkout Cancelled" }]} />
        <p className="eyebrow">Payment</p>
        <h1>Checkout was cancelled.</h1>
      </div>
      <div className="doc-body">
        <p>No payment was completed. You can try again whenever you&apos;re ready.</p>
        <div className="actions">
          <Link className="button" href="/membership">Back to Membership</Link>
          <Link className="button secondary" href="/support">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
