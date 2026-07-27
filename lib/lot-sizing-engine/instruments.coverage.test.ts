import { describe, it, expect } from "vitest";
import { calculateKiraLotSize } from "./index";
import type { CalculationInput, InstrumentSpec } from "./types";
import { instrumentCatalog } from "@/lib/config/instruments";
import { getRiskMode } from "@/lib/config/risk-modes";

/**
 * Per the brief, every priority instrument gets a Normal, a Caution, and a
 * No Trade case. Rather than hand-tune 51 magic numbers, we DERIVE the three
 * inputs from each instrument's own spec so the coverage stays valid if a spec
 * changes. `contractSize × fx` is the per-lot loss per unit of price (the tick
 * method reduces to this because tickValue = contractSize × tickSize).
 */

// Account is USD; rate = profit currency -> USD. USD needs no rate.
const FX_TO_USD: Record<string, number> = {
  USD: 1,
  JPY: 0.0064,
  EUR: 1.08,
  GBP: 1.27,
  CHF: 1.12,
  CAD: 0.73,
};

// A representative entry price per instrument, only required to be larger than
// the distances the derivation produces so the stop stays positive.
const ENTRY: Record<string, number> = {
  XAUUSD: 4000, XAGUSD: 30, EURUSD: 1.1, GBPUSD: 1.27, USDJPY: 156,
  AUDUSD: 0.66, USDCHF: 0.88, USDCAD: 1.37, US30: 40000, US100: 20000,
  US500: 5000, GER40: 18000, UK100: 8000, BTCUSD: 60000, ETHUSD: 3000,
  USOIL: 78, UKOIL: 82,
};

function fxRate(spec: InstrumentSpec): number | undefined {
  const rate = FX_TO_USD[spec.profitCurrency];
  return spec.profitCurrency === "USD" ? undefined : rate;
}

/** Per-lot loss (account currency) for one unit of price move. */
function lossPerUnit(spec: InstrumentSpec): number {
  return spec.contractSize * (FX_TO_USD[spec.profitCurrency] ?? 1);
}

function buy(spec: InstrumentSpec, distance: number, over: Partial<CalculationInput>): CalculationInput {
  const entry = ENTRY[spec.symbol];
  return {
    equity: 10000,
    accountCurrency: "USD",
    leverage: 500,
    instrumentSymbol: spec.symbol,
    direction: "BUY",
    entryPrice: entry,
    stopLossPrice: entry - distance,
    riskModeId: "medium",
    fxRate: fxRate(spec),
    ...over,
  };
}

describe.each(instrumentCatalog)("instrument coverage — $symbol", (spec) => {
  it("Normal: a comfortably tradeable position is within parameters", () => {
    const medium = getRiskMode("medium");
    const equity = 100000;
    const budget = equity * (medium.riskPercent / 100);
    // Target ~0.5 lots after stress.
    const lossStressedTarget = budget / 0.5;
    const lossNormalTarget = lossStressedTarget / medium.stressMultiplier;
    const distance = lossNormalTarget / lossPerUnit(spec);

    const r = calculateKiraLotSize(buy(spec, distance, { equity }));
    expect(r.status).toBe("within_parameters");
    expect(r.recommendedPosition).not.toBeNull();
  });

  it("Caution: broker minimum sits close to the risk limit", () => {
    const medium = getRiskMode("medium");
    const budget = 10000 * (medium.riskPercent / 100);
    // Target stress position ~0.0112 -> floors to 0.01, min-lot loss ~0.89 of budget.
    const lossStressedTarget = budget / 0.0112;
    const lossNormalTarget = lossStressedTarget / medium.stressMultiplier;
    const distance = lossNormalTarget / lossPerUnit(spec);

    const r = calculateKiraLotSize(buy(spec, distance, { equity: 10000 }));
    expect(r.status).toBe("caution");
    expect(r.recommendedPosition).toBe(spec.minLot);
  });

  it("No Trade: a wide stop on a tiny account is refused", () => {
    const entry = ENTRY[spec.symbol];
    const distance = entry * 0.3; // large move relative to price
    const r = calculateKiraLotSize(buy(spec, distance, { equity: 100, riskModeId: "small" }));
    expect(r.status).toBe("no_trade");
    expect(r.recommendedPosition).toBeNull();
  });
});
