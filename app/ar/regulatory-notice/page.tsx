import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Regulatory Notice",
  description: "Arabic translation of the Kira Engineer Hub Regulatory Notice is pending professional review; the English Regulatory Notice is available now.",
  alternates: { canonical: "/ar/regulatory-notice" },
};

export default function ArRegulatoryNoticePage() {
  return (
    <ArabicPlaceholder
      title="Regulatory Notice"
      englishHref="/legal/regulatory-notice"
      englishLabel="Regulatory Notice"
    />
  );
}
