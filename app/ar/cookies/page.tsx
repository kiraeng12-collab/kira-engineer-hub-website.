import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Arabic translation of the Kira Engineer Hub Cookie Policy is pending professional review; the English Cookie Policy is available now.",
  alternates: { canonical: "/ar/cookies" },
};

export default function ArCookiesPage() {
  return (
    <ArabicPlaceholder
      title="Cookie Policy"
      englishHref="/legal/cookie-policy"
      englishLabel="Cookie Policy"
      extraCookieButton
    />
  );
}
