import { describe, it, expect } from "vitest";
import { deriveEventsFromResult } from "./project242-events";
import { calculateKiraLotSize } from "@/lib/lot-sizing-engine";
import type { CalculationInput } from "@/lib/lot-sizing-engine/types";

const base: CalculationInput = {
  equity: 10000,
  accountCurrency: "USD",
  leverage: 100,
  instrumentSymbol: "XAUUSD",
  direction: "BUY",
  entryPrice: 4055,
  stopLossPrice: 4038,
  riskModeId: "medium",
};

describe("deriveEventsFromResult", () => {
  it("always emits LOT_SIZE_CALCULATED", () => {
    const r = calculateKiraLotSize(base);
    const events = deriveEventsFromResult(r, "user_1", "calc_1");
    expect(events[0].eventType).toBe("LOT_SIZE_CALCULATED");
    expect(events[0].userId).toBe("user_1");
    expect(events[0].calculationId).toBe("calc_1");
  });

  it("emits NO_TRADE_RETURNED and BROKER_MINIMUM_EXCEEDED for a rejected trade", () => {
    const r = calculateKiraLotSize({ ...base, equity: 1000, riskModeId: "small", entryPrice: 4100, stopLossPrice: 4038 });
    const types = deriveEventsFromResult(r, null, null).map((e) => e.eventType);
    expect(types).toContain("NO_TRADE_RETURNED");
    expect(types).toContain("BROKER_MINIMUM_EXCEEDED");
  });

  it("emits BIG_MODE_SELECTED when big mode is used", () => {
    const r = calculateKiraLotSize({ ...base, riskModeId: "big", equity: 50000 });
    const types = deriveEventsFromResult(r, null, null).map((e) => e.eventType);
    expect(types).toContain("BIG_MODE_SELECTED");
  });

  it("carries the result status onto every event", () => {
    const r = calculateKiraLotSize(base);
    for (const e of deriveEventsFromResult(r, null, null)) {
      expect(e.status).toBe(r.status);
      expect(e.riskMode).toBe("medium");
    }
  });
});
