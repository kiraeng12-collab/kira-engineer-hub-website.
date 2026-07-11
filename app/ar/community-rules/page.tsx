import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Community Rules",
  description: "Arabic translation of the Kira Engineer Hub Community Rules is pending professional review; the English Community Rules is available now.",
  alternates: { canonical: "/ar/community-rules" },
};

export default function ArCommunityRulesPage() {
  return (
    <ArabicPlaceholder title="Community Rules" englishHref="/community-rules" englishLabel="Community Rules" />
  );
}
