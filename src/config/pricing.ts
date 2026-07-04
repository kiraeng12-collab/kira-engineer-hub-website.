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
    amountCents: 5000,
    amount: 50,
    stripePriceIdEnv: "STRIPE_PRICE_KIRA_VIP_MONTHLY",
    billingMonths: 1,
    recurringInterval: "month",
    intervalCount: 1
  } satisfies VipPlan,
  quarterly: {
    name: "Kira VIP Three-Month Membership",
    amountCents: 13500,
    amount: 135,
    standardEquivalentCents: 15000,
    standardEquivalent: 150,
    savingAmountCents: 1500,
    savingAmount: 15,
    savingPercentage: 10,
    effectiveMonthlyAmountCents: 4500,
    effectiveMonthlyAmount: 45,
    stripePriceIdEnv: "STRIPE_PRICE_KIRA_VIP_THREE_MONTH",
    billingMonths: 3,
    recurringInterval: "month",
    intervalCount: 3
  },
  earlyBird: {
    discountPercentage: 20,
    cutoffDate: "2026-07-01T00:00:00+04:00",
    cutoffDisplay: "1 July 2026 at 12:00 AM Gulf Standard Time",
    lastQualifyingMomentDisplay: "30 June 2026 at 11:59 PM Gulf Standard Time",
    monthlyDiscountedAmountCents: 4000,
    monthlyDiscountedAmount: 40,
    quarterlyDiscountedAmountCents: 10800,
    quarterlyDiscountedAmount: 108,
    couponDuration: "forever",
    couponPercentOff: 20,
    codeFormat: "KIRA-EB-{RANDOM_SECURE_VALUE}"
  }
} as const;
