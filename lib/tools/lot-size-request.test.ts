import { describe, it, expect } from "vitest";
import { parseLotSizeRequest } from "./lot-size-request";

const valid = {
  equity: "10000",
  accountCurrency: "usd",
  leverage: "100",
  instrumentSymbol: "eurusd",
  direction: "buy",
  entryPrice: "1.1",
  stopLossPrice: "1.09",
  riskModeId: "medium",
};

describe("parseLotSizeRequest", () => {
  it("coerces string form fields into a typed input", () => {
    const r = parseLotSizeRequest(valid, "free");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.input.equity).toBe(10000);
    expect(r.input.leverage).toBe(100);
    expect(r.input.entryPrice).toBe(1.1);
    expect(r.input.accountCurrency).toBe("USD");
    expect(r.input.direction).toBe("BUY");
  });

  it("rejects a bad direction and risk mode", () => {
    const r = parseLotSizeRequest({ ...valid, direction: "hold", riskModeId: "huge" }, "free");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.join(" ")).toMatch(/direction/i);
    expect(r.errors.join(" ")).toMatch(/riskModeId/i);
  });

  it("strips VIP-only multiple entries for free users", () => {
    const r = parseLotSizeRequest({ ...valid, numberOfEntries: "3" }, "free");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.input.numberOfEntries).toBeUndefined();
    expect(r.droppedVipFields).toContain("numberOfEntries");
  });

  it("keeps multiple entries for VIP users", () => {
    const r = parseLotSizeRequest({ ...valid, numberOfEntries: "3" }, "vip");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.input.numberOfEntries).toBe(3);
    expect(r.droppedVipFields).toHaveLength(0);
  });

  it("parses a broker spec override object", () => {
    const r = parseLotSizeRequest(
      { ...valid, instrumentSymbol: "XYZ", brokerSpecOverride: { contractSize: "1", tickSize: "0.01", tickValue: "0.01", minLot: "0.01", maxLot: "10", volumeStep: "0.01", profitCurrency: "USD" } },
      "free"
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.input.brokerSpecOverride?.contractSize).toBe(1);
    expect(r.input.brokerSpecOverride?.profitCurrency).toBe("USD");
  });

  it("never lets the body set the access tier", () => {
    const r = parseLotSizeRequest({ ...valid, access: "vip" }, "free");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.input.access).toBe("free");
  });
});
