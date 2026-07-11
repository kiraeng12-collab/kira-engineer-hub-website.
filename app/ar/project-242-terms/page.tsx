import type { Metadata } from "next";
import { ArabicPlaceholder } from "@/components/ArabicPlaceholder";

export const metadata: Metadata = {
  title: "Project 242 Terms",
  description: "Arabic translation of the Kira Engineer Hub Project 242 Terms is pending professional review; the English Project 242 Terms is available now.",
  alternates: { canonical: "/ar/project-242-terms" },
};

export default function ArProject242TermsPage() {
  return (
    <ArabicPlaceholder
      title="Project 242 Terms"
      englishHref="/legal/project-242-terms"
      englishLabel="Project 242 Terms"
    />
  );
}
