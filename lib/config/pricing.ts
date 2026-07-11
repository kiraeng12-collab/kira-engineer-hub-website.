/**
 * Central pricing configuration and pure calculation utilities.
 * Replaces scripts/pricing-config.js and src/config/pricing.ts.
 *
 * Nothing outside this module should hardcode a plan price, the Early Bird
 * discount rate, or a calculated discounted amount — always derive it here
 * so a price change only has to happen in one place.
 */

export type PlanId = "monthly" | "quarterly";

export const pricingConfig = {
  currency: "USD",
  earlyBirdDiscountPercentage: 20,
  earlyBirdCutoffDate: "2026-08-01T00:00:00+04:00",
  earlyBirdCutoffDisplay: "1 August 2026 at 12:00 AM Gulf Standard Time",
  earlyBirdLastQualifyingMomentDisplay: "31 July 2026 at 11:59 PM Gulf Standard Time",
  plans: {
    monthly: {
      id: "monthly" as const,
      name: "KIRA VIP Monthly",
      amountCents: 7000,
      billingMonths: 1,
      recurringInterval: "month" as const,
      intervalCount: 1,
      billingIntervalDescription:
        "Automatically renews monthly until cancelled when online recurring billing is activated.",
      stripePriceIdEnv: "STRIPE_PRICE_KIRA_VIP_MONTHLY",
    },
    quarterly: {
      id: "quarterly" as const,
      name: "KIRA VIP Quarterly",
      amountCents: 18900,
      billingMonths: 3,
      recurringInterval: "month" as const,
      intervalCount: 3,
      billingIntervalDescription:
        "Automatically renews every three months until cancelled when online recurring billing is activated.",
      stripePriceIdEnv: "STRIPE_PRICE_KIRA_VIP_QUARTERLY",
    },
  },
} as const;

function formatUSD(amount: number): string {
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
  const standard = getStandardPrice(plan);
  const discounted = standard * (1 - pricingConfig.earlyBirdDiscountPercentage / 100);
  return Math.round(discounted * 100) / 100;
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
