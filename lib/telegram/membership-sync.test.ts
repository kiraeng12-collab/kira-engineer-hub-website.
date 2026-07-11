import { describe, it, expect } from "vitest";
import { shouldRevokeTelegramAccess } from "./membership-sync";

describe("shouldRevokeTelegramAccess", () => {
  it("revokes access for cancelled, expired, suspended, refunded, and disputed", () => {
    expect(shouldRevokeTelegramAccess("cancelled")).toBe(true);
    expect(shouldRevokeTelegramAccess("expired")).toBe(true);
    expect(shouldRevokeTelegramAccess("suspended")).toBe(true);
    expect(shouldRevokeTelegramAccess("refunded")).toBe(true);
    expect(shouldRevokeTelegramAccess("disputed")).toBe(true);
  });

  it("does not revoke access for active or pending", () => {
    expect(shouldRevokeTelegramAccess("active")).toBe(false);
    expect(shouldRevokeTelegramAccess("pending")).toBe(false);
  });

  it("does not revoke access for past_due, preserving the payment-retry grace period", () => {
    expect(shouldRevokeTelegramAccess("past_due")).toBe(false);
  });
});
