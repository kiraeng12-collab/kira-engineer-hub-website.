import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Arabic translation of the Kira Engineer Hub Terms of Use is pending professional review; the English Terms of Use is available now.",
  alternates: { canonical: "/ar/terms" },
};

export default function ArTermsPage() {
  return <ArabicPlaceholder title="Terms of Use" englishHref="/legal/terms" englishLabel="Terms of Use" />;
}
