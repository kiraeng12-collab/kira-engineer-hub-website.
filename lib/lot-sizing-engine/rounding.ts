/**
 * Volume rounding. The KIRA rule is absolute: a recommended position is ALWAYS
 * rounded DOWN to the broker's volume step, never up — rounding up would push
 * the trade past the selected risk budget.
 */

import Decimal from "decimal.js";

// Generous precision so intermediate division never loses meaningful digits
// for financial position sizing.
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

/**
 * Floor `value` to the nearest lower multiple of `step`.
 * roundDownToStep(0.029411, 0.01) === 0.02
 */
export function roundDownToStep(value: Decimal.Value, step: Decimal.Value): Decimal {
  const v = new Decimal(value);
  const s = new Decimal(step);
  if (s.lte(0)) return v; // no step => no rounding
  if (v.lte(0)) return new Decimal(0);
  const steps = v.div(s).floor();
  return steps.times(s);
}

export { Decimal };
