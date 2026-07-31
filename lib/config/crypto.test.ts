import { describe, it, expect } from "vitest";
import { getCryptoAmount, CRYPTO_ACCESS_DAYS, cryptoPeriodEnd } from "./crypto";
import {
  getCryptoVipConsentItems,
  CRYPTO_VIP_CONSENT_TYPES,
  missingCryptoConsentTypes,
} from "./vip-consent";

describe("crypto pricing", () => {
  it("charges the same USD amount in USDT for each tier (1:1)", () => {
    expect(getCryptoAmount("monthly", null)).toBe(70);
    expect(getCryptoAmount("quarterly", null)).toBe(189);
    expect(getCryptoAmount("monthly", "founding")).toBe(50);
    expect(getCryptoAmount("quarterly", "founding")).toBe(140);
    expect(getCryptoAmount("monthly", "early_bird")).toBe(56);
    expect(getCryptoAmount("quarterly", "early_bird")).toBe(160);
  });

  it("grants a fixed window of 30 / 90 days", () => {
    expect(CRYPTO_ACCESS_DAYS.monthly).toBe(30);
    expect(CRYPTO_ACCESS_DAYS.quarterly).toBe(90);
    const now = new Date("2026-08-01T00:00:00Z");
    expect(cryptoPeriodEnd("monthly", now).toISOString()).toBe("2026-08-31T00:00:00.000Z");
    expect(cryptoPeriodEnd("quarterly", now).toISOString()).toBe("2026-10-30T00:00:00.000Z");
  });
});

describe("crypto consent", () => {
  it("swaps recurring-billing for a fixed-term acknowledgement, keeping four acts", () => {
    const items = getCryptoVipConsentItems();
    const types = items.map((i) => i.type);
    expect(types).toEqual(["agreement", "fixed_term", "risk", "e_records"]);
    expect(types).not.toContain("recurring_billing");
    expect(CRYPTO_VIP_CONSENT_TYPES).toHaveLength(4);
  });

  it("flags any missing crypto consent", () => {
    expect(missingCryptoConsentTypes(["agreement", "fixed_term", "risk", "e_records"])).toEqual([]);
    expect(missingCryptoConsentTypes(["agreement", "risk"])).toEqual(["fixed_term", "e_records"]);
  });
});
