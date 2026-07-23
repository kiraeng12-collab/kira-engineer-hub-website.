import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { legalConfig } from "@/lib/config/legal";

export const metadata: Metadata = {
  title: "Regulatory Notice",
  description: "Regulatory boundaries for Kira Engineer Hub education and technology services.",
  alternates: { canonical: "/legal/regulatory-notice" },
};

export default function RegulatoryNoticePage() {
  return (
    <LegalPageLayout title="Regulatory Notice" lastUpdated="4 July 2026">
      <p>
        This website and its products are operated by {legalConfig.legalEntityName}, a Delaware{" "}
        {legalConfig.legalStructure} in the {legalConfig.registrationCountry} (Delaware File Number{" "}
        {legalConfig.companyRegistrationNumber}), with its registered office at {legalConfig.registeredAddress}.
      </p>
      <p>Kira Engineer Hub provides trading education, financial-market education, risk discipline, market-analysis education, community learning, trading technology updates and related digital products.</p>
      <ul>
        <li>Kira Engineer Hub is not a broker.</li>
        <li>It does not execute trades for users.</li>
        <li>It does not hold customer trading funds.</li>
        <li>It does not manage portfolios or operate a fund.</li>
        <li>It does not provide personalized investment advice.</li>
        <li>It does not promise returns or trading performance.</li>
      </ul>
      <p>Regulatory treatment may vary by user location, product structure and future service features. Users are responsible for complying with local rules before accessing trading products or markets.</p>
    </LegalPageLayout>
  );
}
