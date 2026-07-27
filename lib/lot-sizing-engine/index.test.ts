import { describe, it, expect } from "vitest";
import { calculateKiraLotSize } from "./index";
import type { CalculationInput } from "./types";

/** A valid EURUSD Buy on a USD account; individual tests override fields. */
function baseInput(overrides: Partial<CalculationInput> = {}): CalculationInput {
  return {
    equity: 10000,
    accountCurrency: "USD",
    leverage: 100,
    instrumentSymbol: "EURUSD",
    direction: "BUY",
    entryPrice: 1.1,
    stopLossPrice: 1.09,
    riskModeId: "medium",
    ...overrides,
  };
}

describe("calculateKiraLotSize — core sizing", () => {
  it("sizes EURUSD from risk, not leverage, and rounds down", () => {
    const r = calculateKiraLotSize(baseInput());
    // risk 50, lossPerLot 1000 -> raw 0.05; stressed 1750 -> 0.028571 -> 0.02
    expect(r.status).toBe("within_parameters");
    expect(r.rawRiskPosition).toBeCloseTo(0.05, 10);
    expect(r.stressAdjustedPosition).toBeCloseTo(0.0285714, 5);
    expect(r.recommendedPosition).toBe(0.02);
    expect(r.normalRiskAmount).toBeCloseTo(50, 10);
  });

  it("recommends the stress-adjusted (lower) position, not the raw one", () => {
    const r = calculateKiraLotSize(baseInput());
    expect(r.recommendedPosition!).toBeLessThanOrEqual(r.rawRiskPosition!);
    expect(r.stressAdjustedPosition!).toBeLessThan(r.rawRiskPosition!);
  });

  it("estimates margin for a USD-quoted instrument (XAUUSD)", () => {
    const r = calculateKiraLotSize(
      baseInput({ instrumentSymbol: "XAUUSD", entryPrice: 4055, stopLossPrice: 4038, leverage: 500 })
    );
    // distance 17 -> lossPerLot 1700; stressed 2975 -> stressPos 0.0168 -> 0.01
    expect(r.recommendedPosition).toBe(0.01);
    // margin per lot = 100*4055/500 = 811; at 0.01 lots -> 8.11 USD
    expect(r.requiredMargin).toBeCloseTo(8.11, 2);
    expect(r.status).toBe("within_parameters");
  });

  it("scales risk amount with equity and mode", () => {
    const small = calculateKiraLotSize(baseInput({ riskModeId: "small" }));
    const big = calculateKiraLotSize(baseInput({ riskModeId: "big" }));
    expect(small.normalRiskAmount).toBeCloseTo(25, 10); // 0.25%
    expect(big.normalRiskAmount).toBeCloseTo(100, 10); // 1.0%
  });
});

describe("calculateKiraLotSize — currency conversion", () => {
  it("converts JPY profit currency to a USD account when a rate is supplied", () => {
    const r = calculateKiraLotSize(
      baseInput({
        instrumentSymbol: "USDJPY",
        direction: "SELL",
        entryPrice: 156.0,
        stopLossPrice: 156.5,
        fxRate: 0.0064,
        leverage: 100,
      })
    );
    // 500 ticks * 100 JPY = 50000 JPY * 0.0064 = 320 USD lossPerLot
    expect(r.lossPerLotNormal).toBeCloseTo(320, 6);
    // stressed 560 -> stressPos 50/560 = 0.089285 -> 0.08
    expect(r.recommendedPosition).toBe(0.08);
    expect(r.status).not.toBe("no_trade");
  });

  it("returns No Trade rather than guessing a missing FX rate", () => {
    const r = calculateKiraLotSize(
      baseInput({ instrumentSymbol: "USDJPY", direction: "SELL", entryPrice: 156, stopLossPrice: 156.5 })
    );
    expect(r.status).toBe("no_trade");
    expect(r.recommendedPosition).toBeNull();
    expect(r.rejectionReasons.join(" ")).toMatch(/conversion rate/i);
  });
});

describe("calculateKiraLotSize — No Trade", () => {
  it("returns No Trade when the broker minimum exceeds the risk limit", () => {
    const r = calculateKiraLotSize(
      baseInput({ instrumentSymbol: "XAUUSD", equity: 1000, riskModeId: "small", entryPrice: 4100, stopLossPrice: 4038 })
    );
    expect(r.status).toBe("no_trade");
    expect(r.recommendedPosition).toBeNull();
    expect(r.rejectionReasons.length).toBeGreaterThan(0);
  });

  it("does not force the broker minimum of 0.01", () => {
    const r = calculateKiraLotSize(
      baseInput({ instrumentSymbol: "XAUUSD", equity: 1000, riskModeId: "small", entryPrice: 4100, stopLossPrice: 4038 })
    );
    expect(r.recommendedPosition).not.toBe(0.01);
  });
});

describe("calculateKiraLotSize — statuses", () => {
  it("flags Caution when the broker minimum is close to the risk limit", () => {
    const r = calculateKiraLotSize(
      baseInput({ instrumentSymbol: "XAUUSD", equity: 10000, riskModeId: "medium", entryPrice: 4063, stopLossPrice: 4038 })
    );
    // distance 25 -> lossPerLot 2500, stressed 4375; 0.01*4375=43.75 >= 0.8*50=40
    expect(r.recommendedPosition).toBe(0.01);
    expect(r.status).toBe("caution");
    expect(r.warnings.join(" ")).toMatch(/minimum lot/i);
  });

  it("flags High Risk for Big mode on a small account", () => {
    const r = calculateKiraLotSize(
      baseInput({ instrumentSymbol: "XAUUSD", equity: 1000, riskModeId: "big", entryPrice: 4040, stopLossPrice: 4038, leverage: 500 })
    );
    expect(r.recommendedPosition).not.toBeNull();
    expect(r.status).toBe("high_risk");
    expect(r.warnings.join(" ")).toMatch(/big mode/i);
  });

  it("flags Caution when holding through news", () => {
    const r = calculateKiraLotSize(baseInput({ holdThroughNews: true }));
    expect(["caution", "high_risk"]).toContain(r.status);
    expect(r.warnings.join(" ")).toMatch(/news/i);
  });

  it("flags Caution and warns when specs are user-supplied (unverified)", () => {
    const r = calculateKiraLotSize(
      baseInput({
        instrumentSymbol: "XYZ123",
        entryPrice: 100,
        stopLossPrice: 99,
        brokerSpecOverride: {
          contractSize: 1,
          tickSize: 0.01,
          tickValue: 0.01,
          minLot: 0.01,
          maxLot: 50,
          volumeStep: 0.01,
          profitCurrency: "USD",
          marginCurrency: "USD",
        },
      })
    );
    expect(r.warnings.join(" ")).toMatch(/not been independently verified/i);
  });
});

describe("calculateKiraLotSize — validation", () => {
  it("rejects a Buy whose stop is above entry", () => {
    const r = calculateKiraLotSize(baseInput({ direction: "BUY", entryPrice: 1.09, stopLossPrice: 1.1 }));
    expect(r.status).toBe("no_trade");
    expect(r.rejectionReasons.join(" ")).toMatch(/below the entry/i);
  });

  it("rejects a Sell whose stop is below entry", () => {
    const r = calculateKiraLotSize(baseInput({ direction: "SELL", entryPrice: 1.1, stopLossPrice: 1.09 }));
    expect(r.status).toBe("no_trade");
    expect(r.rejectionReasons.join(" ")).toMatch(/above the entry/i);
  });

  it("rejects entry equal to stop-loss", () => {
    const r = calculateKiraLotSize(baseInput({ entryPrice: 1.1, stopLossPrice: 1.1 }));
    expect(r.status).toBe("no_trade");
    expect(r.rejectionReasons.join(" ")).toMatch(/cannot equal/i);
  });

  it("rejects zero and negative equity", () => {
    expect(calculateKiraLotSize(baseInput({ equity: 0, balance: undefined })).status).toBe("no_trade");
    expect(calculateKiraLotSize(baseInput({ equity: -100, balance: undefined })).status).toBe("no_trade");
  });

  it("falls back to balance when equity is absent", () => {
    const r = calculateKiraLotSize(baseInput({ equity: undefined, balance: 10000 }));
    expect(r.status).not.toBe("no_trade");
    expect(r.equityUsed).toBe(10000);
  });

  it("rejects an unknown instrument with no override", () => {
    const r = calculateKiraLotSize(baseInput({ instrumentSymbol: "NOPE", entryPrice: 100, stopLossPrice: 99 }));
    expect(r.status).toBe("no_trade");
    expect(r.rejectionReasons.join(" ")).toMatch(/specification/i);
  });
});

describe("calculateKiraLotSize — multiple entries (VIP)", () => {
  it("splits the position across entries without exceeding the total", () => {
    const r = calculateKiraLotSize(
      baseInput({ instrumentSymbol: "XAUUSD", entryPrice: 4045, stopLossPrice: 4038, riskModeId: "big", numberOfEntries: 3, leverage: 500 })
    );
    expect(r.recommendedPosition).not.toBeNull();
    expect(r.entries).toBeDefined();
    const sum = r.entries!.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(r.recommendedPosition!, 10);
    r.entries!.forEach((e) => expect(e).toBeGreaterThanOrEqual(r.brokerMinLot));
  });

  it("reduces the entry count when the position cannot support it", () => {
    const r = calculateKiraLotSize(
      baseInput({ instrumentSymbol: "XAUUSD", entryPrice: 4063, stopLossPrice: 4038, numberOfEntries: 5 })
    );
    // recommended is 0.01 => cannot make 5 entries at 0.01 minimum
    expect(r.entries!.length).toBeLessThan(5);
    expect(r.warnings.join(" ")).toMatch(/entries/i);
  });
});

describe("calculateKiraLotSize — invariants", () => {
  it("never recommends a position that risks more than the budget at the normal stop", () => {
    const r = calculateKiraLotSize(baseInput());
    expect(r.normalEstimatedLoss!).toBeLessThanOrEqual(r.normalRiskAmount);
  });

  it("stamps a version and timestamp on every result", () => {
    const r = calculateKiraLotSize(baseInput());
    expect(r.calculationVersion).toMatch(/\d+\.\d+\.\d+/);
    expect(() => new Date(r.timestamp).toISOString()).not.toThrow();
  });

  it("recommended position is a multiple of the volume step", () => {
    const r = calculateKiraLotSize(baseInput());
    const ratio = Math.round(r.recommendedPosition! / r.brokerVolumeStep);
    expect(Math.abs(ratio * r.brokerVolumeStep - r.recommendedPosition!)).toBeLessThan(1e-9);
  });
});
