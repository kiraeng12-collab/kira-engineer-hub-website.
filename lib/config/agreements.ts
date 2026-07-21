import { legalConfig } from "./legal";
import type { ProductId } from "./products";

/**
 * Agreement registry — which documents a member must accept before a product
 * grants access.
 *
 * The *text* lives in version control (the pages under app/legal), and the
 * version string comes from legalConfig. That pairing is what makes an
 * acceptance defensible later: given a stored (key, version) we can reproduce
 * the exact wording the member agreed to.
 *
 * Bumping a version in legalConfig automatically forces re-acceptance.
 */

export type AgreementKey =
  | "membership_terms"
  | "risk_disclosure"
  | "copy_trading_agreement"
  | "academy_terms";

export type AgreementDefinition = {
  key: AgreementKey;
  title: string;
  version: string;
  /** Public URL of the exact document being accepted. */
  href: string;
  /**
   * "published" — live document, safe to require.
   * "pending_counsel" — not written yet. Its products must NOT be sold: the
   * gate treats a pending requirement as a hard block rather than skipping it.
   */
  status: "published" | "pending_counsel";
  requiredForProducts: ProductId[];
};

export const agreementRegistry: Record<AgreementKey, AgreementDefinition> = {
  membership_terms: {
    key: "membership_terms",
    title: "KIRA VIP Membership Terms",
    version: legalConfig.membershipTermsVersion,
    href: "/legal/membership-terms",
    status: "published",
    requiredForProducts: ["vip_membership"],
  },
  risk_disclosure: {
    key: "risk_disclosure",
    title: "Risk Disclosure",
    version: legalConfig.riskDisclosureVersion,
    href: "/legal/risk-disclosure",
    status: "published",
    requiredForProducts: ["vip_membership", "copy_trading"],
  },
  // Regulated activity — must be drafted/reviewed by counsel before copy
  // trading is offered. Left pending on purpose so the gate blocks it.
  copy_trading_agreement: {
    key: "copy_trading_agreement",
    title: "Copy Trading Agreement",
    version: "pending",
    href: "/legal/copy-trading-agreement",
    status: "pending_counsel",
    requiredForProducts: ["copy_trading"],
  },
  academy_terms: {
    key: "academy_terms",
    title: "KIRA Academy Terms",
    version: "pending",
    href: "/legal/academy-terms",
    status: "pending_counsel",
    requiredForProducts: ["academy"],
  },
};

export const ALL_AGREEMENT_KEYS = Object.keys(agreementRegistry) as AgreementKey[];

export function isAgreementKey(value: unknown): value is AgreementKey {
  return typeof value === "string" && value in agreementRegistry;
}

export function getAgreement(key: AgreementKey): AgreementDefinition {
  return agreementRegistry[key];
}

/** Agreements a single product requires. */
export function requiredAgreementsForProduct(product: ProductId): AgreementDefinition[] {
  return Object.values(agreementRegistry).filter((a) => a.requiredForProducts.includes(product));
}

/** Agreements required across a set of products, de-duplicated. */
export function requiredAgreementsForProducts(products: ProductId[]): AgreementDefinition[] {
  const seen = new Map<AgreementKey, AgreementDefinition>();
  for (const product of products) {
    for (const agreement of requiredAgreementsForProduct(product)) {
      seen.set(agreement.key, agreement);
    }
  }
  return [...seen.values()];
}
