import { describe, it, expect } from "vitest";
import { isEntitlementActive } from "./service";

const at = (iso: string) => new Date(iso);
const NOW = at("2026-08-05T12:00:00Z");

describe("isEntitlementActive", () => {
  it("grants access for an active entitlement with a future period end", () => {
    expect(
      isEntitlementActive(
        { product: "vip_membership", status: "active", currentPeriodEnd: at("2026-09-01T00:00:00Z") },
        NOW
      )
    ).toBe(true);
  });

  it("grants access for a one-off purchase with no period end (Academy)", () => {
    expect(
      isEntitlementActive({ product: "academy", status: "active", currentPeriodEnd: null }, NOW)
    ).toBe(true);
  });

  it("keeps access during past_due (Stripe retry grace window)", () => {
    expect(
      isEntitlementActive(
        { product: "vip_membership", status: "past_due", currentPeriodEnd: at("2026-09-01T00:00:00Z") },
        NOW
      )
    ).toBe(true);
  });

  it("revokes access once the period end has passed", () => {
    expect(
      isEntitlementActive(
        { product: "vip_membership", status: "active", currentPeriodEnd: at("2026-08-01T00:00:00Z") },
        NOW
      )
    ).toBe(false);
  });

  it.each(["cancelled", "expired", "refunded", "disputed"])(
    "revokes access for status %s",
    (status) => {
      expect(
        isEntitlementActive(
          { product: "vip_membership", status, currentPeriodEnd: at("2026-09-01T00:00:00Z") },
          NOW
        )
      ).toBe(false);
    }
  );
});
