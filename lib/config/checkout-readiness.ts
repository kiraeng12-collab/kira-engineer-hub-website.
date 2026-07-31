import { legalConfig, type LegalConfig } from "./legal";
import { hasLaunched, getLaunchAt } from "./launch";

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
  /** Configured and legally clear to sell (env switch + all legal fields). */
  ready: boolean;
  /** Has the public launch moment passed? */
  launched: boolean;
  /** ready AND launched — checkout may actually happen right now. */
  open: boolean;
  /** The public launch instant, ISO 8601. */
  launchAt: string;
  checkoutEnvEnabled: boolean;
  missingLegalFields: string[];
};

/**
 * Whether checkout is allowed to activate right now. Combines the
 * CHECKOUT_ENABLED environment switch, a scan of legalConfig for any
 * still-missing mandatory field, and the public launch gate — so checkout is
 * fully wired and verifiable before launch, yet cannot transact until the
 * launch moment (nobody can be charged early even with the URL).
 */
export function getCheckoutReadiness(
  env: NodeJS.ProcessEnv = process.env,
  now: Date = new Date()
): CheckoutReadiness {
  const checkoutEnvEnabled = env.CHECKOUT_ENABLED === "true";
  const missingLegalFields = REQUIRED_LEGAL_FIELDS.filter(({ field }) =>
    isPlaceholderOrEmpty(legalConfig[field])
  ).map(({ label }) => label);

  const ready = checkoutEnvEnabled && missingLegalFields.length === 0;
  const launched = hasLaunched(now, env);

  return {
    ready,
    launched,
    open: ready && launched,
    launchAt: getLaunchAt(env).toISOString(),
    checkoutEnvEnabled,
    missingLegalFields,
  };
}

/** True only when checkout can actually happen right now (ready AND launched). */
export function isCheckoutReady(env: NodeJS.ProcessEnv = process.env, now: Date = new Date()): boolean {
  return getCheckoutReadiness(env, now).open;
}
