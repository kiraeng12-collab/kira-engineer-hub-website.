/**
 * Product catalog — the single source of truth for what KIRA sells and what
 * access each purchase grants.
 *
 * Kept separate from pricing.ts: pricing.ts owns the VIP membership's billing
 * plans (monthly/quarterly + tier pricing); this module owns the *products*
 * (VIP membership, Academy, Copy-trading add-on) and the entitlements they
 * unlock. The Stripe webhook maps a purchased Price back to a product here,
 * then grants the listed entitlements.
 */

export type ProductId = "vip_membership" | "academy" | "copy_trading";

/** What a purchase unlocks. One product may grant several. */
export type EntitlementKey = "vip_telegram" | "academy_web" | "copy_trading";

export type ProductDefinition = {
  id: ProductId;
  name: string;
  /** Stripe Checkout mode. "subscription" recurs; "payment" is a one-off. */
  mode: "subscription" | "payment";
  /** Entitlements granted while this product is active. */
  grants: EntitlementKey[];
  /**
   * Env var names holding the Stripe Price IDs for this product. VIP
   * membership resolves its price through pricing.ts instead (per plan/tier),
   * so it lists none here.
   */
  stripePriceIdEnvs: string[];
  /** Add-ons that only make sense alongside an active VIP membership. */
  requiresActiveVip: boolean;
};

export const productCatalog: Record<ProductId, ProductDefinition> = {
  vip_membership: {
    id: "vip_membership",
    name: "KIRA VIP Membership",
    mode: "subscription",
    grants: ["vip_telegram"],
    // Prices come from pricingConfig (monthly/quarterly x standard/founding).
    stripePriceIdEnvs: [
      "STRIPE_PRICE_KIRA_VIP_MONTHLY",
      "STRIPE_PRICE_KIRA_VIP_MONTHLY_FOUNDING",
      "STRIPE_PRICE_KIRA_VIP_QUARTERLY",
      "STRIPE_PRICE_KIRA_VIP_QUARTERLY_FOUNDING",
    ],
    requiresActiveVip: false,
  },
  academy: {
    id: "academy",
    name: "KIRA Academy",
    // One-time purchase. Switch to "subscription" here if Academy ever
    // becomes recurring — nothing else needs to change.
    mode: "payment",
    grants: ["academy_web"],
    stripePriceIdEnvs: ["STRIPE_PRICE_KIRA_ACADEMY"],
    requiresActiveVip: false,
  },
  copy_trading: {
    id: "copy_trading",
    name: "KIRA Copy Trading Add-on",
    mode: "subscription",
    grants: ["copy_trading"],
    stripePriceIdEnvs: ["STRIPE_PRICE_KIRA_COPY_TRADING"],
    requiresActiveVip: true,
  },
};

export const ALL_PRODUCT_IDS = Object.keys(productCatalog) as ProductId[];

export function isProductId(value: unknown): value is ProductId {
  return typeof value === "string" && value in productCatalog;
}

/**
 * Resolves which product a purchased Stripe Price belongs to, by comparing the
 * price ID against the configured env vars. Returns null for an unknown price
 * so the webhook can log and ignore rather than granting something wrong.
 */
export function productForPriceId(
  priceId: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env
): ProductDefinition | null {
  if (!priceId) return null;
  for (const product of Object.values(productCatalog)) {
    for (const envName of product.stripePriceIdEnvs) {
      if (env[envName] && env[envName] === priceId) return product;
    }
  }
  return null;
}

/** Entitlements granted by a set of active products. */
export function entitlementsForProducts(productIds: ProductId[]): EntitlementKey[] {
  const keys = new Set<EntitlementKey>();
  for (const id of productIds) {
    for (const grant of productCatalog[id].grants) keys.add(grant);
  }
  return [...keys];
}
