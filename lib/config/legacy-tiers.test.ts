import { describe, it, expect } from "vitest";
import { tierForJoinDate, bestTier } from "./legacy-tiers";

const at = (iso: string) => new Date(iso);

describe("tierForJoinDate", () => {
  it("gives founding to 2024 joiners", () => {
    expect(tierForJoinDate(at("2024-01-01T00:00:00Z"))).toBe("founding");
    expect(tierForJoinDate(at("2024-12-31T23:59:59Z"))).toBe("founding");
  });

  it("gives founding to anyone who joined before 2024 too", () => {
    expect(tierForJoinDate(at("2023-06-15T12:00:00Z"))).toBe("founding");
  });

  it("gives early_bird to 2025 joiners", () => {
    expect(tierForJoinDate(at("2025-01-01T00:00:00Z"))).toBe("early_bird");
    expect(tierForJoinDate(at("2025-12-31T23:59:59Z"))).toBe("early_bird");
  });

  it("still gives early_bird to 2026 joiners before the 1 Aug cutoff", () => {
    expect(tierForJoinDate(at("2026-07-31T00:00:00Z"))).toBe("early_bird");
  });

  it("gives standard pricing from the cutoff onwards", () => {
    // Cutoff is 2026-08-01T00:00:00+04:00 = 2026-07-31T20:00:00Z
    expect(tierForJoinDate(at("2026-08-02T00:00:00Z"))).toBeNull();
    expect(tierForJoinDate(at("2026-09-15T00:00:00Z"))).toBeNull();
  });

  it("returns null for an invalid date rather than guessing a discount", () => {
    expect(tierForJoinDate(new Date("not-a-date"))).toBeNull();
  });
});

describe("bestTier", () => {
  it("upgrades from nothing to a tier", () => {
    expect(bestTier(null, "early_bird")).toBe("early_bird");
    expect(bestTier(null, "founding")).toBe("founding");
  });

  it("upgrades early_bird to founding", () => {
    expect(bestTier("early_bird", "founding")).toBe("founding");
  });

  it("never downgrades an existing deeper discount", () => {
    expect(bestTier("founding", "early_bird")).toBe("founding");
    expect(bestTier("founding", null)).toBe("founding");
    expect(bestTier("early_bird", null)).toBe("early_bird");
  });
});
