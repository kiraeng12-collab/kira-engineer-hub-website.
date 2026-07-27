import { describe, it, expect } from "vitest";
import { resolveEntryPrice } from "./entry-range";

describe("resolveEntryPrice", () => {
  it("uses the highest entry as worst case for a Buy", () => {
    expect(resolveEntryPrice("BUY", 4050, 4055, "worst")).toBe(4055);
  });

  it("uses the lowest entry as worst case for a Sell", () => {
    expect(resolveEntryPrice("SELL", 4050, 4055, "worst")).toBe(4050);
  });

  it("averages the range when asked", () => {
    expect(resolveEntryPrice("BUY", 4050, 4056, "average")).toBe(4053);
  });

  it("uses the best (narrowest-stop) entry when asked", () => {
    expect(resolveEntryPrice("BUY", 4050, 4055, "best")).toBe(4050);
    expect(resolveEntryPrice("SELL", 4050, 4055, "best")).toBe(4055);
  });

  it("is order-insensitive about which bound is min/max", () => {
    expect(resolveEntryPrice("BUY", 4055, 4050, "worst")).toBe(4055);
  });
});
