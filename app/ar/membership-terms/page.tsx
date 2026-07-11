import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Membership Terms",
  description: "Arabic translation of the Kira Engineer Hub Membership Terms is pending professional review; the English Membership Terms is available now.",
  alternates: { canonical: "/ar/membership-terms" },
};

export default function ArMembershipTermsPage() {
  return (
    <ArabicPlaceholder
      title="Membership Terms"
      englishHref="/legal/membership-terms"
      englishLabel="Membership Terms"
    />
  );
}
