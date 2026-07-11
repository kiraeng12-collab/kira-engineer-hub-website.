import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Early Bird Lifetime Discount",
  description: "Arabic translation of the Kira Engineer Hub Early Bird Lifetime Discount page is pending professional review; the English Early Bird page is available now.",
  alternates: { canonical: "/ar/early-bird" },
};

export default function ArEarlyBirdPage() {
  return (
    <ArabicPlaceholder
      title="Early Bird Lifetime Discount"
      englishHref="/early-bird"
      englishLabel="Early Bird page"
      noticeText="Arabic legal and commercial translation requires professional review before publication. Until approved, please use the English Early Bird page."
    />
  );
}
