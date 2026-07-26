import { pricingConfig, getPriceForTier, type PlanId, type MembershipTier } from "./pricing";

/**
 * Crypto payment configuration (USDT on TRON / TRC20, via NOWPayments).
 *
 * Crypto is a ONE-TIME payment: paying the "monthly" plan buys a fixed 30-day
 * access window and "quarterly" buys 90 days, after which access lapses unless
 * the member pays again. There is no auto-renew - a wallet cannot be charged on
 * a schedule - so a scheduled sweep (see /api/crypto/sweep) removes access when
 * a window ends. Because USDT is a US-dollar stablecoin, the amount charged is
 * the same number as the USD price (1 USDT = 1 USD).
 */

// NOWPayments pay-currency code for USDT on the TRON (TRC20) network.
export const CRYPTO_PAY_CURRENCY = "usdttrc20";
export const CRYPTO_PRICE_CURRENCY = "usd";
export const CRYPTO_NETWORK_LABEL = "USDT · TRC20 (Tron)";

/** Access days granted per plan for a one-time crypto payment. */
export const CRYPTO_ACCESS_DAYS: Record<PlanId, number> = {
  monthly: 30,
  quarterly: 90,
};

/** The amount to charge in USDT for a plan/tier (1:1 with the USD price). */
export function getCryptoAmount(plan: PlanId, tier: MembershipTier | null | undefined): number {
  return getPriceForTier(plan, tier);
}

/** Fixed access-window end for a crypto purchase, from "now". */
export function cryptoPeriodEnd(plan: PlanId, now: Date = new Date()): Date {
  return new Date(now.getTime() + CRYPTO_ACCESS_DAYS[plan] * 24 * 60 * 60 * 1000);
}

/** Human display of the amount, e.g. "56 USDT". */
export function getCryptoAmountDisplay(plan: PlanId, tier: MembershipTier | null | undefined): string {
  return `${getCryptoAmount(plan, tier)} USDT`;
}

/**
 * Crypto checkout is gated by its own switch AND the shared automation switch,
 * so it can be turned on independently of card checkout but still respects the
 * global kill-switch used before launch.
 */
export function isCryptoCheckoutEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  // Tolerant of case and stray whitespace from hand-entered dashboard values.
  return (env.CRYPTO_CHECKOUT_ENABLED || "").trim().toLowerCase() === "true";
}

export const cryptoConfig = {
  payCurrency: CRYPTO_PAY_CURRENCY,
  priceCurrency: CRYPTO_PRICE_CURRENCY,
  networkLabel: CRYPTO_NETWORK_LABEL,
  accessDays: CRYPTO_ACCESS_DAYS,
  currency: pricingConfig.currency,
} as const;
