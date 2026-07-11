import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Complaints Procedure",
  description: "Arabic translation of the Kira Engineer Hub Complaints Procedure is pending professional review; the English Complaints Procedure is available now.",
  alternates: { canonical: "/ar/complaints" },
};

export default function ArComplaintsPage() {
  return (
    <ArabicPlaceholder title="Complaints Procedure" englishHref="/complaints" englishLabel="Complaints Procedure" />
  );
}
