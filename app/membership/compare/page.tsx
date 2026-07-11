import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ComparisonTable } from "@/components/ComparisonTable";
import { comparisonColumns, comparisonRows } from "@/lib/config/comparison";

export const metadata: Metadata = {
  title: "Compare KIRA Products",
  description:
    "Compare Kira Trading Community, KIRA VIP Membership, KIRA Academy, and Project 242 by feature, availability, and payment model.",
  alternates: { canonical: "/membership/compare" },
};

export default function MembershipComparePage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Membership", href: "/membership" }, { label: "Compare" }]} />
        <p className="eyebrow">Product Comparison</p>
        <h1>Each Kira product serves a different purpose.</h1>
      </div>
      <div className="doc-body">
        <ComparisonTable
          columns={comparisonColumns}
          rows={comparisonRows}
          caption="Feature comparison across Kira Trading Community, KIRA VIP Membership, KIRA Academy, and Project 242"
        />
        <div className="risk-warning">
          <strong>Important</strong>
          Availability does not imply suitability. All decisions remain the responsibility of the user.
        </div>
      </div>
    </div>
  );
}
