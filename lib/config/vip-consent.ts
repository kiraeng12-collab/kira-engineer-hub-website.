import { agreementRegistry } from "./agreements";
import { legalConfig } from "./legal";

/**
 * The VIP Membership signing screen — the exact consents from the KIRA
 * Checkout & Legal Launch Guide (§6).
 *
 * These are deliberately SEPARATE affirmative acts. A single blanket checkbox
 * does not prove recurring-billing consent, electronic-record consent, or a
 * trading-risk acknowledgement independently, which is the whole point of the
 * consent architecture.
 *
 * Kept short on purpose: four ticks plus name/country is a ~20 second signing.
 */

export type ConsentType = "agreement" | "recurring_billing" | "fixed_term" | "risk" | "e_records";

export type ConsentItemDefinition = {
  type: ConsentType;
  /** Exact wording shown next to the checkbox. */
  label: string;
  /** Agreement this consent is tied to, if any. */
  agreement: keyof typeof agreementRegistry | null;
  version: string;
  /** Documents the member must be able to open/download at this step. */
  documents: { title: string; href: string }[];
};

/** Everything a member must tick to sign up for VIP. All are required. */
export function getVipConsentItems(): ConsentItemDefinition[] {
  const membership = agreementRegistry.membership_terms;
  const risk = agreementRegistry.risk_disclosure;

  return [
    {
      type: "agreement",
      label:
        "I have read, can download, and agree to the KIRA VIP Membership Agreement, Terms of Use, Risk Disclosure, Refund and Cancellation Policy, and Privacy Notice.",
      agreement: "membership_terms",
      version: membership.version,
      documents: [
        { title: membership.title, href: membership.href },
        { title: "Terms of Use", href: "/legal/terms" },
        { title: risk.title, href: risk.href },
        { title: "Refund and Cancellation Policy", href: "/legal/refund-policy" },
        { title: "Privacy Notice", href: "/legal/privacy" },
      ],
    },
    {
      type: "recurring_billing",
      // The amount/frequency are injected by the UI from the selected plan.
      label:
        "I expressly authorize KIRA to charge the amount shown above every billing period until I cancel, and I understand how to cancel online.",
      agreement: null,
      version: legalConfig.membershipTermsVersion,
      documents: [{ title: "Refund and Cancellation Policy", href: "/legal/refund-policy" }],
    },
    {
      type: "risk",
      label:
        "I understand trading can cause partial or total loss, and that KIRA VIP content is general education — not personal financial advice or a promise of profit.",
      agreement: "risk_disclosure",
      version: risk.version,
      documents: [{ title: risk.title, href: risk.href }],
    },
    {
      type: "e_records",
      label:
        "I consent to electronic records and signatures and can access, download, and retain PDF documents. I may request a paper copy or withdraw electronic-delivery consent through support.",
      agreement: null,
      version: legalConfig.termsVersion,
      documents: [],
    },
  ];
}

export const VIP_CONSENT_TYPES: ConsentType[] = [
  "agreement",
  "recurring_billing",
  "risk",
  "e_records",
];

/**
 * Crypto VIP consents. Crypto is a one-time payment for a fixed access window,
 * so the recurring-billing authorization is replaced by a fixed-term
 * acknowledgement; the other three affirmative acts are unchanged.
 */
export function getCryptoVipConsentItems(): ConsentItemDefinition[] {
  return getVipConsentItems().map((item) =>
    item.type === "recurring_billing"
      ? {
          type: "fixed_term",
          label:
            "I understand this is a one-time crypto payment for a fixed access period that does NOT renew automatically, that crypto payments are final and non-refundable, and that access ends when the period lapses unless I pay again.",
          agreement: null,
          version: item.version,
          documents: [{ title: "Refund and Cancellation Policy", href: "/legal/refund-policy" }],
        }
      : item
  );
}

export const CRYPTO_VIP_CONSENT_TYPES: ConsentType[] = [
  "agreement",
  "fixed_term",
  "risk",
  "e_records",
];

/** Every consent must be ticked — returns the ones that are missing. */
export function missingConsentTypes(provided: string[]): ConsentType[] {
  const given = new Set(provided);
  return VIP_CONSENT_TYPES.filter((type) => !given.has(type));
}

/** Crypto variant of {@link missingConsentTypes}. */
export function missingCryptoConsentTypes(provided: string[]): ConsentType[] {
  const given = new Set(provided);
  return CRYPTO_VIP_CONSENT_TYPES.filter((type) => !given.has(type));
}
