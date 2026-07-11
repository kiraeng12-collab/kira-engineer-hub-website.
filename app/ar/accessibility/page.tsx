import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "Arabic translation of the Kira Engineer Hub Accessibility Statement is pending professional review; the English Accessibility Statement is available now.",
  alternates: { canonical: "/ar/accessibility" },
};

export default function ArAccessibilityPage() {
  return (
    <ArabicPlaceholder
      title="Accessibility Statement"
      englishHref="/legal/accessibility"
      englishLabel="Accessibility Statement"
    />
  );
}
