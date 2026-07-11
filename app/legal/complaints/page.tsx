import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Complaints Procedure",
  description: "How to submit and resolve complaints about Kira Engineer Hub services.",
  alternates: { canonical: "/legal/complaints" },
};

export default function LegalComplaintsPage() {
  return (
    <LegalPageLayout title="Complaints Procedure" lastUpdated="4 July 2026">
      <h2>How to submit a complaint</h2>
      <p>
        Use the <Link href="/complaints">complaint form</Link> or contact{" "}
        <a href="mailto:KE@kiraengineerhub.com">KE@kiraengineerhub.com</a>. Include your full name, email, Telegram
        username, product or access area, payment reference if relevant, a clear description, supporting evidence
        and requested resolution.
      </p>
      <h2>Review process</h2>
      <p>Kira Engineer Hub aims to acknowledge complaints within 7 business days where practical and provide a response within 30 business days where practical. Complex matters may require more time.</p>
      <h2>Complaint types</h2>
      <p>Complaints may relate to payment issues, community conduct, membership access, privacy matters, content concerns or technical access.</p>
      <h2>Confidentiality and rights</h2>
      <p>Complaint records are handled as confidential support information. Nothing in this procedure limits rights that cannot lawfully be excluded.</p>
    </LegalPageLayout>
  );
}
