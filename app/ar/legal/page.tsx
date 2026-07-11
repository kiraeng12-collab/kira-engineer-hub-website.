import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Legal Center",
  description: "Arabic translation of the Kira Engineer Hub Legal Center is pending professional review; the English Legal Center is available now.",
  alternates: { canonical: "/ar/legal" },
};

export default function ArLegalPage() {
  return (
    <ArabicPlaceholder
      title="Legal Center"
      englishHref="/legal"
      englishLabel="Legal Center"
      showBreadcrumbs
    />
  );
}
