import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCheckoutReadiness } from "./checkout-readiness";

describe("checkout readiness fail-safe", () => {
  it("is not ready when CHECKOUT_ENABLED is not set to true", () => {
    const result = getCheckoutReadiness({ ...process.env, CHECKOUT_ENABLED: "false" });
    expect(result.ready).toBe(false);
    expect(result.checkoutEnvEnabled).toBe(false);
  });

  // The mandatory legal fields were filled from the Delaware Certificate of
  // Formation (July 2026), so the only remaining gate is the env switch.
  it("is ready once CHECKOUT_ENABLED=true and every mandatory legal field is filled", () => {
    const result = getCheckoutReadiness({ ...process.env, CHECKOUT_ENABLED: "true" });
    expect(result.checkoutEnvEnabled).toBe(true);
    expect(result.missingLegalFields).toEqual([]);
    expect(result.ready).toBe(true);
  });
});

describe("public launch gate", () => {
  const before = new Date("2026-07-01T00:00:00Z");
  const after = new Date("2026-12-01T00:00:00Z");
  const enabled = { ...process.env, CHECKOUT_ENABLED: "true" };

  it("is ready but NOT open before the launch moment", () => {
    const r = getCheckoutReadiness(enabled, before);
    expect(r.ready).toBe(true);
    expect(r.launched).toBe(false);
    expect(r.open).toBe(false);
  });

  it("opens once the launch moment has passed", () => {
    const r = getCheckoutReadiness(enabled, after);
    expect(r.launched).toBe(true);
    expect(r.open).toBe(true);
  });

  it("honours a LAUNCH_AT override", () => {
    const r = getCheckoutReadiness({ ...enabled, LAUNCH_AT: "2020-01-01T00:00:00Z" }, before);
    expect(r.launched).toBe(true);
    expect(r.open).toBe(true);
  });
});

// The whole point of this module is that a missing legal value can never be
// overridden by the env switch. Prove that guarantee still holds by putting a
// placeholder back through a mocked legalConfig.
describe("a placeholder legal field still blocks checkout", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("stays blocked even with CHECKOUT_ENABLED=true", async () => {
    vi.doMock("./legal", async (importOriginal) => {
      const actual = await importOriginal<typeof import("./legal")>();
      return {
        ...actual,
        legalConfig: { ...actual.legalConfig, governingLaw: "[INSERT GOVERNING LAW]" },
      };
    });

    const { getCheckoutReadiness: freshReadiness } = await import("./checkout-readiness");
    const result = freshReadiness({ ...process.env, CHECKOUT_ENABLED: "true" });

    expect(result.checkoutEnvEnabled).toBe(true);
    expect(result.ready).toBe(false);
    expect(result.missingLegalFields).toContain("Governing law");

    vi.doUnmock("./legal");
  });
});
