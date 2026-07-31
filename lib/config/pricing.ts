/**
 * Central pricing configuration and pure calculation utilities.
 * Replaces scripts/pricing-config.js and src/config/pricing.ts.
 *
 * Nothing outside this module should hardcode a plan price, the Early Bird
 * discount rate, or a calculated discounted amount — always derive it here
 * so a price change only has to happen in one place.
 */

export type PlanId = "monthly" | "quarterly";

// null = standard pricing. "founding" = permanent flat discounted price for
// members who joined Kira Trading Community before 2025 (2024 or earlier).
// "early_bird" = permanent flat discounted price for members who joined from
// 2025 through the 1 Aug 2026 cutoff. Each tier has its own fixed prices (not
// a percentage), set by an admin (Phase 8 review), never by the member or a
// client request.
export type MembershipTier = "founding" | "early_bird";

export const pricingConfig = {
  currency: "USD",
  // Nominal headline used only on the Early Bird request record; Early Bird
  // pricing is now set as explicit amounts per plan below, not a flat percent.
  earlyBirdDiscountPercentage: 20,
  earlyBirdCutoffDate: "2026-08-01T00:00:00+04:00",
  earlyBirdCutoffDisplay: "1 August 2026 at 12:00 AM Gulf Standard Time",
  earlyBirdLastQualifyingMomentDisplay: "31 July 2026 at 11:59 PM Gulf Standard Time",
  // Loyalty window for the deepest ("founding") tier - members who joined
  // Kira Trading Community in this window keep this price permanently.
  foundingWindowDisplay: "2024 or earlier",
  plans: {
    monthly: {
      id: "monthly" as const,
      name: "KIRA VIP Monthly",
      amountCents: 7000,
      foundingAmountCents: 5000,
      earlyBirdAmountCents: 5600,
      billingMonths: 1,
      recurringInterval: "month" as const,
      intervalCount: 1,
      billingIntervalDescription:
        "Automatically renews monthly until cancelled when online recurring billing is activated.",
      stripePriceIdEnv: "STRIPE_PRICE_KIRA_VIP_MONTHLY",
      stripePriceIdEnvFounding: "STRIPE_PRICE_KIRA_VIP_MONTHLY_FOUNDING",
      stripePriceIdEnvEarlyBird: "STRIPE_PRICE_KIRA_VIP_MONTHLY_EARLYBIRD",
    },
    quarterly: {
      id: "quarterly" as const,
      name: "KIRA VIP Quarterly",
      amountCents: 18900,
      foundingAmountCents: 14000,
      earlyBirdAmountCents: 16000,
      billingMonths: 3,
      recurringInterval: "month" as const,
      intervalCount: 3,
      billingIntervalDescription:
        "Automatically renews every three months until cancelled when online recurring billing is activated.",
      stripePriceIdEnv: "STRIPE_PRICE_KIRA_VIP_QUARTERLY",
      stripePriceIdEnvFounding: "STRIPE_PRICE_KIRA_VIP_QUARTERLY_FOUNDING",
      stripePriceIdEnvEarlyBird: "STRIPE_PRICE_KIRA_VIP_QUARTERLY_EARLYBIRD",
    },
  },
} as const;

export function formatUSD(amount: number): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return `USD ${amount.toFixed(hasCents ? 2 : 0)}`;
}

/** Standard (non-discounted) price for a plan, in whole currency units. */
export function getStandardPrice(plan: PlanId): number {
  return pricingConfig.plans[plan].amountCents / 100;
}

export function getStandardPriceDisplay(plan: PlanId): string {
  const amount = getStandardPrice(plan);
  return plan === "monthly" ? `${formatUSD(amount)} per month` : `${formatUSD(amount)} every three months`;
}

/** What the quarterly plan would cost if paid as three separate monthly payments. */
export function getQuarterlyStandardEquivalent(): number {
  return getStandardPrice("monthly") * pricingConfig.plans.quarterly.billingMonths;
}

/** Amount and percentage saved by choosing quarterly over three monthly payments. */
export function getQuarterlySaving(): { amount: number; percentage: number } {
  const equivalent = getQuarterlyStandardEquivalent();
  const quarterly = getStandardPrice("quarterly");
  const amount = Math.round((equivalent - quarterly) * 100) / 100;
  const percentage = Math.round((amount / equivalent) * 100);
  return { amount, percentage };
}

/** Quarterly price expressed as an effective monthly rate. */
export function getQuarterlyEffectiveMonthly(): number {
  return Math.round((getStandardPrice("quarterly") / pricingConfig.plans.quarterly.billingMonths) * 100) / 100;
}

/** Early Bird (discounted) price for a plan, in whole currency units. */
export function getEarlyBirdPrice(plan: PlanId): number {
  return pricingConfig.plans[plan].earlyBirdAmountCents / 100;
}

export function getEarlyBirdPriceDisplay(plan: PlanId): string {
  const amount = getEarlyBirdPrice(plan);
  return plan === "monthly"
    ? `${formatUSD(amount)} per month for verified Early Bird members`
    : `${formatUSD(amount)} every three months for verified Early Bird members`;
}

/** Whether "now" falls before the Early Bird cutoff date. */
export function isEarlyBirdWindowOpen(now: Date = new Date()): boolean {
  return now.getTime() < new Date(pricingConfig.earlyBirdCutoffDate).getTime();
}

/** Founding Member price (deepest, permanent discount), in whole currency units. */
export function getFoundingPrice(plan: PlanId): number {
  return pricingConfig.plans[plan].foundingAmountCents / 100;
}

export function getFoundingPriceDisplay(plan: PlanId): string {
  const amount = getFoundingPrice(plan);
  return plan === "monthly"
    ? `${formatUSD(amount)} per month for Founding Members`
    : `${formatUSD(amount)} every three months for Founding Members`;
}

/** Resolves the correct price for whichever tier a member is on (or standard if none). */
export function getPriceForTier(plan: PlanId, tier: MembershipTier | null | undefined): number {
  if (tier === "founding") return getFoundingPrice(plan);
  if (tier === "early_bird") return getEarlyBirdPrice(plan);
  return getStandardPrice(plan);
}

/** Resolves the correct Stripe Price env var name for whichever tier a member is on. */
export function getStripePriceEnvForTier(plan: PlanId, tier: MembershipTier | null | undefined): string {
  const planConfig = pricingConfig.plans[plan];
  if (tier === "founding") return planConfig.stripePriceIdEnvFounding;
  if (tier === "early_bird") return planConfig.stripePriceIdEnvEarlyBird;
  return planConfig.stripePriceIdEnv;
}
