import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Membership Inactive",
  robots: { index: false, follow: false },
  alternates: { canonical: "/membership-inactive" },
};

export default function MembershipInactivePage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Membership Inactive" }]} />
        <p className="eyebrow">Membership</p>
        <h1>Your membership isn&apos;t active.</h1>
      </div>
      <div className="doc-body">
        <p>
          This area requires an active KIRA VIP Membership. If you believe this is a mistake - for example, a
          recent payment that hasn&apos;t been confirmed yet, or a billing issue - check your account or contact
          support.
        </p>
        <div className="actions">
          <Link className="button" href="/account/billing">Check Billing</Link>
          <Link className="button secondary" href="/membership">View Membership Plans</Link>
          <Link className="button secondary" href="/support">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
