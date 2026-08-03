import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Checkout Complete",
  robots: { index: false, follow: false },
  alternates: { canonical: "/checkout/success" },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string }>;
}) {
  const { src } = await searchParams;
  const fromTelegram = src === "telegram";

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
          {fromTelegram
            ? "Your payment was received. Head back to Telegram — the KIRA bot is sending your VIP invite links to your chat right now (this usually takes a few moments)."
            : "Your payment was received. Your membership will be confirmed automatically once Stripe verifies the subscription - this usually takes a few moments, and can take a little longer in some cases."}
        </div>
        <div className="actions">
          {fromTelegram ? (
            <a className="button" href="https://t.me/KiratradingVIP_Bot">Return to Telegram</a>
          ) : (
            <Link className="button" href="/account/membership">View Membership Status</Link>
          )}
          <Link className="button secondary" href="/support">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
