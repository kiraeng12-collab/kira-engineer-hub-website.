import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "Accessibility statement and feedback route for Kira Engineer Hub.",
  alternates: { canonical: "/legal/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <LegalPageLayout title="Accessibility Statement" lastUpdated="4 July 2026">
      <p>
        Kira Engineer Hub aims to provide a website experience that is usable, readable and navigable for as many
        visitors as practical. The site has visible focus styles, semantic page structure, labels for forms and
        responsive layouts.
      </p>
      <p>
        We do not claim full accessibility compliance until independent testing confirms it. Accessibility feedback
        can be sent to <a href="mailto:KE@kiraengineerhub.com">KE@kiraengineerhub.com</a>.
      </p>
    </LegalPageLayout>
  );
}
