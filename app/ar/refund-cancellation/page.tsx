import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy",
  description: "Arabic translation of the Kira Engineer Hub Refund and Cancellation Policy is pending professional review; the English version is available now.",
  alternates: { canonical: "/ar/refund-cancellation" },
};

export default function ArRefundCancellationPage() {
  return (
    <ArabicPlaceholder
      title="Refund and Cancellation Policy"
      englishHref="/legal/refund-policy"
      englishLabel="Refund and Cancellation Policy"
    />
  );
}
