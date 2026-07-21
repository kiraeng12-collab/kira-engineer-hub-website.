import { describe, it, expect } from "vitest";
import { evaluateConsent } from "./service";
import type { AgreementDefinition } from "@/lib/config/agreements";

const published = (key: string, version: string): AgreementDefinition =>
  ({
    key,
    title: key,
    version,
    href: `/legal/${key}`,
    status: "published",
    requiredForProducts: ["vip_membership"],
  }) as AgreementDefinition;

const pendingCounsel = (key: string): AgreementDefinition =>
  ({
    key,
    title: key,
    version: "pending",
    href: `/legal/${key}`,
    status: "pending_counsel",
    requiredForProducts: ["copy_trading"],
  }) as AgreementDefinition;

describe("evaluateConsent", () => {
  it("passes when every required agreement is accepted at the current version", () => {
    const result = evaluateConsent(
      [published("membership_terms", "2026.07"), published("risk_disclosure", "2026.07")],
      [
        { agreement: "membership_terms", version: "2026.07" },
        { agreement: "risk_disclosure", version: "2026.07" },
      ]
    );
    expect(result.ok).toBe(true);
  });

  it("passes when nothing is required", () => {
    expect(evaluateConsent([], []).ok).toBe(true);
  });

  it("blocks when an agreement was never accepted", () => {
    const result = evaluateConsent(
      [published("membership_terms", "2026.07"), published("risk_disclosure", "2026.07")],
      [{ agreement: "membership_terms", version: "2026.07" }]
    );
    expect(result).toMatchObject({ ok: false, reason: "agreements_not_accepted" });
    if (result.ok === false && result.reason === "agreements_not_accepted") {
      expect(result.missing.map((a) => a.key)).toEqual(["risk_disclosure"]);
    }
  });

  it("forces re-acceptance when the version was bumped (stale consent is not consent)", () => {
    const result = evaluateConsent(
      [published("membership_terms", "2026.08")],
      [{ agreement: "membership_terms", version: "2026.07" }]
    );
    expect(result).toMatchObject({ ok: false, reason: "agreements_not_accepted" });
  });

  it("hard-blocks a product whose agreement is still pending counsel, even if something was accepted", () => {
    const result = evaluateConsent(
      [pendingCounsel("copy_trading_agreement"), published("risk_disclosure", "2026.07")],
      [
        { agreement: "risk_disclosure", version: "2026.07" },
        { agreement: "copy_trading_agreement", version: "pending" },
      ]
    );
    expect(result).toMatchObject({ ok: false, reason: "agreements_pending_counsel" });
    if (result.ok === false && result.reason === "agreements_pending_counsel") {
      expect(result.blocking.map((a) => a.key)).toEqual(["copy_trading_agreement"]);
    }
  });
});
