/**
 * Central legal configuration. Replaces scripts/legal-config.js and
 * src/config/legal.ts.
 *
 * Fields left as "[INSERT ...]" placeholders are pending real values from the
 * business owner and must NOT be invented or guessed. checkout-readiness.ts
 * uses this file to block checkout activation until they're filled in.
 */

export type LegalConfig = {
  legalEntityName: string;
  tradingName: string;
  legalStructure: string;
  companyRegistrationNumber: string;
  tradeLicenceNumber: string;
  licensingAuthority: string;
  registeredAddress: string;
  registrationCountry: string;
  governingLaw: string;
  courtJurisdiction: string;
  vatNumber: string;
  regulatoryStatus: string;
  minimumAge: string;
  supportEmail: string;
  complaintsEmail: string;
  privacyEmail: string;
  cancellationDeadline: string;
  refundRequestPeriod: string;
  complaintAcknowledgementTarget: string;
  complaintResolutionTarget: string;
  lastLegalReviewDate: string;
  termsVersion: string;
  privacyVersion: string;
  riskDisclosureVersion: string;
  refundPolicyVersion: string;
  membershipTermsVersion: string;
};

export const legalConfig: LegalConfig = {
  // Verified against the Delaware Certificate of Formation (executed 18 July 2026).
  legalEntityName: "Kira Engineer Hub, LLC",
  tradingName: "Kira Engineer Hub",
  legalStructure: "Limited Liability Company (LLC)",
  // Delaware Secretary of State file number, from the approved Certificate of
  // Formation (filed 20 July 2026). Public record - searchable at
  // icis.corp.delaware.gov.
  companyRegistrationNumber: "10704476",
  // A US LLC has no trade licence, financial licensing authority, or VAT -
  // these are Gulf-jurisdiction concepts that do not apply.
  tradeLicenceNumber: "Not applicable (United States LLC)",
  licensingAuthority: "Not applicable (United States LLC)",
  // Registered office of the Company in Delaware (registered agent: Legalinc
  // Corporate Services Inc.).
  registeredAddress: "131 Continental Drive, Suite 305, Newark, DE 19713, New Castle County, Delaware, United States",
  registrationCountry: "United States",
  // Delaware is the natural default for a Delaware LLC. Confirm with counsel
  // before launch if you sell into jurisdictions with mandatory local venue.
  governingLaw: "State of Delaware, United States",
  courtJurisdiction: "Courts of the State of Delaware, United States",
  vatNumber: "Not applicable (United States LLC)",
  // Education-only disclaimer (owner-approved 22 July 2026). States what the
  // company is NOT rather than claiming any authorisation, which is the safe
  // posture for an unregulated trading-education business.
  regulatoryStatus:
    "Kira Engineer Hub, LLC provides trading and financial-market education and related technology only. It is not a licensed or regulated financial adviser, broker-dealer, or investment manager, does not execute trades or hold client funds, and does not provide personalized investment advice.",
  minimumAge: "18",
  supportEmail: "KE@kiraengineerhub.com",
  complaintsEmail: "KE@kiraengineerhub.com",
  privacyEmail: "KE@kiraengineerhub.com",
  cancellationDeadline: "Before the next renewal date",
  refundRequestPeriod: "As soon as possible after the billing issue or access-delivery issue is identified",
  complaintAcknowledgementTarget: "Within 7 business days where practical",
  complaintResolutionTarget: "Within 30 business days where practical",
  lastLegalReviewDate: "4 July 2026",
  termsVersion: "2026.07",
  privacyVersion: "2026.07",
  riskDisclosureVersion: "2026.07",
  refundPolicyVersion: "2026.07",
  membershipTermsVersion: "2026.07",
};
