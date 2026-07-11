import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "Arabic translation of the Kira Engineer Hub Affiliate and Conflicts Disclosure is pending professional review; the English version is available now.",
  alternates: { canonical: "/ar/affiliate-disclosure" },
};

export default function ArAffiliateDisclosurePage() {
  return (
    <ArabicPlaceholder
      title="Affiliate Disclosure"
      englishHref="/legal/affiliate-disclosure"
      englishLabel="Affiliate and Conflicts Disclosure"
    />
  );
}
