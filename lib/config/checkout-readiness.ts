import { legalConfig, type LegalConfig } from "./legal";

/**
 * Fail-safe gate: checkout must never activate while a legally required
 * value is still missing or a placeholder. This is the single source of
 * truth both the /membership CTA and the /api/checkout route defer to —
 * neither should duplicate this list.
 */
const REQUIRED_LEGAL_FIELDS: { field: keyof LegalConfig; label: string }[] = [
  { field: "legalEntityName", label: "Legal entity name" },
  { field: "registeredAddress", label: "Registered address" },
  { field: "governingLaw", label: "Governing law" },
  { field: "courtJurisdiction", label: "Dispute venue / court jurisdiction" },
  { field: "cancellationDeadline", label: "Cancellation rules" },
  { field: "refundRequestPeriod", label: "Refund rules" },
  { field: "supportEmail", label: "Payment support email" },
  { field: "privacyEmail", label: "Privacy contact" },
  { field: "termsVersion", label: "Terms version / effective date" },
  { field: "refundPolicyVersion", label: "Refund policy version / effective date" },
];

function isPlaceholderOrEmpty(value: string): boolean {
  return value.trim().length === 0 || /^\[INSERT/.test(value.trim());
}

export type CheckoutReadiness = {
  ready: boolean;
  checkoutEnvEnabled: boolean;
  missingLegalFields: string[];
};

/**
 * Whether checkout is allowed to activate right now. Combines the
 * CHECKOUT_ENABLED environment switch with a scan of legalConfig for any
 * still-missing mandatory field.
 */
export function getCheckoutReadiness(env: NodeJS.ProcessEnv = process.env): CheckoutReadiness {
  const checkoutEnvEnabled = env.CHECKOUT_ENABLED === "true";
  const missingLegalFields = REQUIRED_LEGAL_FIELDS.filter(({ field }) =>
    isPlaceholderOrEmpty(legalConfig[field])
  ).map(({ label }) => label);

  return {
    ready: checkoutEnvEnabled && missingLegalFields.length === 0,
    checkoutEnvEnabled,
    missingLegalFields,
  };
}

export function isCheckoutReady(env: NodeJS.ProcessEnv = process.env): boolean {
  return getCheckoutReadiness(env).ready;
}
