import { describe, it, expect } from "vitest";
import {
  getStandardPrice,
  getQuarterlyStandardEquivalent,
  getQuarterlySaving,
  getQuarterlyEffectiveMonthly,
  getEarlyBirdPrice,
  isEarlyBirdWindowOpen,
  getFoundingPrice,
  getPriceForTier,
  getStripePriceEnvForTier,
} from "./pricing";

describe("pricing utilities", () => {
  it("returns standard prices in whole currency units", () => {
    expect(getStandardPrice("monthly")).toBe(70);
    expect(getStandardPrice("quarterly")).toBe(189);
  });

  it("calculates the quarterly standard equivalent as 3x monthly", () => {
    expect(getQuarterlyStandardEquivalent()).toBe(210);
  });

  it("calculates the quarterly saving as USD 21 (10%)", () => {
    const saving = getQuarterlySaving();
    expect(saving.amount).toBe(21);
    expect(saving.percentage).toBe(10);
  });

  it("calculates the quarterly effective monthly rate as USD 63", () => {
    expect(getQuarterlyEffectiveMonthly()).toBe(63);
  });

  it("applies the 20% Early Bird discount correctly", () => {
    expect(getEarlyBirdPrice("monthly")).toBe(56);
    expect(getEarlyBirdPrice("quarterly")).toBe(151.2);
  });

  it("treats the Early Bird window as open before the cutoff", () => {
    expect(isEarlyBirdWindowOpen(new Date("2026-07-31T23:00:00+04:00"))).toBe(true);
  });

  it("treats the Early Bird window as closed at/after the cutoff", () => {
    expect(isEarlyBirdWindowOpen(new Date("2026-08-01T00:00:01+04:00"))).toBe(false);
  });

  it("returns the flat Founding Member prices", () => {
    expect(getFoundingPrice("monthly")).toBe(50);
    expect(getFoundingPrice("quarterly")).toBe(150);
  });

  describe("getPriceForTier", () => {
    it("returns the founding price for the founding tier", () => {
      expect(getPriceForTier("monthly", "founding")).toBe(50);
      expect(getPriceForTier("quarterly", "founding")).toBe(150);
    });

    it("returns the early bird price for the early_bird tier", () => {
      expect(getPriceForTier("monthly", "early_bird")).toBe(56);
      expect(getPriceForTier("quarterly", "early_bird")).toBe(151.2);
    });

    it("returns the standard price for null/undefined tier", () => {
      expect(getPriceForTier("monthly", null)).toBe(70);
      expect(getPriceForTier("monthly", undefined)).toBe(70);
    });
  });

  describe("getStripePriceEnvForTier", () => {
    it("resolves the founding env var name for the founding tier", () => {
      expect(getStripePriceEnvForTier("monthly", "founding")).toBe("STRIPE_PRICE_KIRA_VIP_MONTHLY_FOUNDING");
      expect(getStripePriceEnvForTier("quarterly", "founding")).toBe("STRIPE_PRICE_KIRA_VIP_QUARTERLY_FOUNDING");
    });

    it("resolves the standard env var name for early_bird and null tiers", () => {
      expect(getStripePriceEnvForTier("monthly", "early_bird")).toBe("STRIPE_PRICE_KIRA_VIP_MONTHLY");
      expect(getStripePriceEnvForTier("monthly", null)).toBe("STRIPE_PRICE_KIRA_VIP_MONTHLY");
    });
  });
});
