import { describe, it, expect } from "vitest";
import {
  getStandardPrice,
  getQuarterlyStandardEquivalent,
  getQuarterlySaving,
  getQuarterlyEffectiveMonthly,
  getEarlyBirdPrice,
  isEarlyBirdWindowOpen,
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
});
