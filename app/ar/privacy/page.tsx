import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Arabic translation of the Kira Engineer Hub Privacy Policy is pending professional review; the English Privacy Policy is available now.",
  alternates: { canonical: "/ar/privacy" },
};

export default function ArPrivacyPage() {
  return <ArabicPlaceholder title="Privacy Policy" englishHref="/legal/privacy" englishLabel="Privacy Policy" />;
}
