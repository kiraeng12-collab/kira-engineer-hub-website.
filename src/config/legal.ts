export type LegalConfig = {
  legalEntityName: string;
  tradingName: string;
  legalStructure: string;
  tradeLicenceNumber: string;
  licensingAuthority: string;
  registeredAddress: string;
  jurisdiction: string;
  country: string;
  supportEmail: string;
  complaintsEmail: string;
  privacyEmail: string;
  businessPhone: string;
  vatNumber: string;
  regulatoryStatus: string;
  governingLaw: string;
  courtJurisdiction: string;
  minimumAge: string;
  refundRequestPeriod: string;
  complaintAcknowledgementTarget: string;
  complaintResolutionTarget: string;
  lastLegalReviewDate: string;
  termsVersion: string;
  privacyVersion: string;
  riskDisclosureVersion: string;
  refundPolicyVersion: string;
};

export const legalConfig: LegalConfig = {
  legalEntityName: "[INSERT LEGAL ENTITY NAME]",
  tradingName: "Kira Engineer Hub",
  legalStructure: "[INSERT LEGAL STRUCTURE]",
  tradeLicenceNumber: "[INSERT TRADE LICENCE NUMBER]",
  licensingAuthority: "[INSERT LICENSING AUTHORITY]",
  registeredAddress: "[INSERT REGISTERED ADDRESS]",
  jurisdiction: "[INSERT JURISDICTION]",
  country: "United Arab Emirates",
  supportEmail: "KE@kiraengineerhub.com",
  complaintsEmail: "KE@kiraengineerhub.com",
  privacyEmail: "KE@kiraengineerhub.com",
  businessPhone: "[INSERT BUSINESS PHONE]",
  vatNumber: "[INSERT VAT/TRN IF APPLICABLE]",
  regulatoryStatus: "[INSERT COUNSEL-REVIEWED REGULATORY STATUS]",
  governingLaw: "[INSERT GOVERNING LAW]",
  courtJurisdiction: "[INSERT COURT JURISDICTION]",
  minimumAge: "18",
  refundRequestPeriod: "[INSERT REFUND REQUEST PERIOD]",
  complaintAcknowledgementTarget: "[INSERT ACKNOWLEDGEMENT TARGET]",
  complaintResolutionTarget: "[INSERT RESOLUTION TARGET]",
  lastLegalReviewDate: "[INSERT LEGAL REVIEW DATE]",
  termsVersion: "2026.07",
  privacyVersion: "2026.07",
  riskDisclosureVersion: "2026.07",
  refundPolicyVersion: "2026.07"
};
