import { describe, it, expect } from "vitest";
import { productForPriceId, entitlementsForProducts, isProductId } from "./products";

const ENV = {
  STRIPE_PRICE_KIRA_VIP_MONTHLY: "price_vip_monthly",
  STRIPE_PRICE_KIRA_VIP_QUARTERLY_FOUNDING: "price_vip_q_founding",
  STRIPE_PRICE_KIRA_ACADEMY: "price_academy",
  STRIPE_PRICE_KIRA_COPY_TRADING: "price_copy",
} as unknown as NodeJS.ProcessEnv;

describe("productForPriceId", () => {
  it("maps a VIP price to the membership product", () => {
    expect(productForPriceId("price_vip_monthly", ENV)?.id).toBe("vip_membership");
  });

  it("maps a founding-tier VIP price to the same membership product", () => {
    expect(productForPriceId("price_vip_q_founding", ENV)?.id).toBe("vip_membership");
  });

  it("maps the academy and copy-trading prices", () => {
    expect(productForPriceId("price_academy", ENV)?.id).toBe("academy");
    expect(productForPriceId("price_copy", ENV)?.id).toBe("copy_trading");
  });

  it("returns null for an unknown price rather than guessing", () => {
    expect(productForPriceId("price_not_ours", ENV)).toBeNull();
    expect(productForPriceId(null, ENV)).toBeNull();
  });

  it("does not match when the env var is unset (avoids undefined === undefined)", () => {
    expect(productForPriceId(undefined as unknown as string, {} as NodeJS.ProcessEnv)).toBeNull();
  });
});

describe("entitlementsForProducts", () => {
  it("grants vip_telegram for the membership", () => {
    expect(entitlementsForProducts(["vip_membership"])).toEqual(["vip_telegram"]);
  });

  it("combines entitlements across products without duplicates", () => {
    const keys = entitlementsForProducts(["vip_membership", "academy", "copy_trading"]);
    expect(new Set(keys)).toEqual(new Set(["vip_telegram", "academy_web", "copy_trading"]));
    expect(keys.length).toBe(3);
  });

  it("returns nothing for no products", () => {
    expect(entitlementsForProducts([])).toEqual([]);
  });
});

describe("isProductId", () => {
  it("accepts catalog ids and rejects anything else", () => {
    expect(isProductId("vip_membership")).toBe(true);
    expect(isProductId("academy")).toBe(true);
    expect(isProductId("nonsense")).toBe(false);
    expect(isProductId(undefined)).toBe(false);
  });
});
