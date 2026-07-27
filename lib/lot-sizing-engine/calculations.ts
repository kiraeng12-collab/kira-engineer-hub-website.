/**
 * Core risk-sizing math, all in decimal arithmetic. Every function here is
 * pure and returns Decimals; the orchestrator (index.ts) composes them and
 * converts to plain numbers only at the very edge.
 */

import type { InstrumentSpec } from "./types";
import { Decimal } from "./rounding";

/** Risk budget in the account currency: equity × riskPercent. */
export function riskAmount(equity: Decimal.Value, riskPercent: Decimal.Value): Decimal {
  return new Decimal(equity).times(new Decimal(riskPercent).div(100));
}

/** Absolute price distance between entry and stop-loss. */
export function stopDistance(entry: Decimal.Value, stop: Decimal.Value): Decimal {
  return new Decimal(entry).minus(stop).abs();
}

/**
 * Loss (in the instrument's PROFIT currency) if a 1.00-lot position is stopped
 * out after moving `distance`.
 *
 * Prefers the tick-value method (most reliable per broker):
 *   ticks = distance / tickSize ; loss = ticks × tickValue
 * Falls back to the contract-size method when tick data is absent:
 *   loss = distance × contractSize
 */
export function lossPerLotInProfitCurrency(distance: Decimal.Value, spec: InstrumentSpec): Decimal {
  const d = new Decimal(distance);
  if (spec.tickSize > 0 && spec.tickValue > 0) {
    const ticks = d.div(spec.tickSize);
    return ticks.times(spec.tickValue);
  }
  return d.times(spec.contractSize);
}

/** Raw risk-based position, before stress, margin, and rounding. */
export function rawPosition(risk: Decimal.Value, lossPerLotAccount: Decimal.Value): Decimal {
  const loss = new Decimal(lossPerLotAccount);
  if (loss.lte(0)) return new Decimal(0);
  return new Decimal(risk).div(loss);
}
