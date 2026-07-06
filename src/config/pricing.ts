export type VipPlan = {
  name: string;
  amountCents: number;
  amount: number;
  stripePriceIdEnv: string;
  billingMonths: number;
  recurringInterval: "month";
  intervalCount: number;
};

export const pricingConfig = {
  currency: "USD",
  monthly: {
    name: "Kira VIP Monthly Membership",
    amountCents: 7000,
    amount: 70,
    stripePriceIdEnv: "STRIPE_PRICE_KIRA_VIP_MONTHLY",
    billingMonths: 1,
    recurringInterval: "month",
    intervalCount: 1
  } satisfies VipPlan,
  quarterly: {
    name: "Kira VIP Three-Month Membership",
    amountCents: 18900,
    amount: 189,
    standardEquivalentCents: 21000,
    standardEquivalent: 210,
    savingAmountCents: 2100,
    savingAmount: 21,
    savingPercentage: 10,
    effectiveMonthlyAmountCents: 6300,
    effectiveMonthlyAmount: 63,
    stripePriceIdEnv: "STRIPE_PRICE_KIRA_VIP_THREE_MONTH",
    billingMonths: 3,
    recurringInterval: "month",
    intervalCount: 3
  },
  earlyBird: {
    discountPercentage: 20,
    cutoffDate: "2026-08-01T00:00:00+04:00",
    cutoffDisplay: "1 August 2026 at 12:00 AM Gulf Standard Time",
    lastQualifyingMomentDisplay: "31 July 2026 at 11:59 PM Gulf Standard Time",
    monthlyDiscountedAmountCents: 5600,
    monthlyDiscountedAmount: 56,
    quarterlyDiscountedAmountCents: 15120,
    quarterlyDiscountedAmount: 151.20,
    couponDuration: "forever",
    couponPercentOff: 20,
    codeFormat: "KIRA-EB-{RANDOM_SECURE_VALUE}"
  }
} as const;
