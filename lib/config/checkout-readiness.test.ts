import { describe, it, expect } from "vitest";
import { getCheckoutReadiness } from "./checkout-readiness";

describe("checkout readiness fail-safe", () => {
  it("is not ready when CHECKOUT_ENABLED is not set to true", () => {
    const result = getCheckoutReadiness({ ...process.env, CHECKOUT_ENABLED: "false" });
    expect(result.ready).toBe(false);
    expect(result.checkoutEnvEnabled).toBe(false);
  });

  it("is not ready today even with CHECKOUT_ENABLED=true, because legal fields are still placeholders", () => {
    const result = getCheckoutReadiness({ ...process.env, CHECKOUT_ENABLED: "true" });
    expect(result.checkoutEnvEnabled).toBe(true);
    expect(result.ready).toBe(false);
    expect(result.missingLegalFields).toEqual(
      expect.arrayContaining(["Legal entity name", "Governing law", "Registered address"])
    );
  });
});
