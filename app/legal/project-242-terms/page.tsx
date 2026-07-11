import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Project 242 Terms",
  description: "Limited public terms for Project 242 while in development.",
  alternates: { canonical: "/legal/project-242-terms" },
};

export default function Project242TermsPage() {
  return (
    <LegalPageLayout title="Project 242 Terms" lastUpdated="4 July 2026">
      <p>Project 242 is a proprietary risk-management initiative currently in development. Additional details will be released when its product, protection and delivery framework are ready.</p>
      <p>Project 242 is not currently offered as a purchasable product through this website. Public information is intentionally limited and does not reveal methodology, internal design or commercial terms.</p>
      <p>Any future offer will require clear product terms, privacy information, risk disclosures, refund and cancellation terms, and checkout readiness before payment is accepted.</p>
    </LegalPageLayout>
  );
}
