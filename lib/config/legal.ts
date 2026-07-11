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
  legalEntityName: "[INSERT LEGAL ENTITY NAME]",
  tradingName: "Kira Engineer Hub",
  legalStructure: "[INSERT LEGAL STRUCTURE]",
  tradeLicenceNumber: "[INSERT TRADE LICENCE NUMBER]",
  licensingAuthority: "[INSERT LICENSING AUTHORITY]",
  registeredAddress: "[INSERT REGISTERED ADDRESS]",
  registrationCountry: "United Arab Emirates",
  governingLaw: "[INSERT GOVERNING LAW]",
  courtJurisdiction: "[INSERT COURT JURISDICTION]",
  vatNumber: "[INSERT VAT/TRN IF APPLICABLE]",
  regulatoryStatus: "[INSERT COUNSEL-REVIEWED REGULATORY STATUS]",
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
