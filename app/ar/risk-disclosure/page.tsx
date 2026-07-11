import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Risk Disclosure",
  description: "Arabic translation of the Kira Engineer Hub Risk Disclosure is pending professional review; the English Risk Disclosure is available now.",
  alternates: { canonical: "/ar/risk-disclosure" },
};

export default function ArRiskDisclosurePage() {
  return (
    <ArabicPlaceholder title="Risk Disclosure" englishHref="/legal/risk-disclosure" englishLabel="Risk Disclosure" />
  );
}
