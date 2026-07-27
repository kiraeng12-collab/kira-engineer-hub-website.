/**
 * Currency conversion. Loss-per-lot and margin are first computed in the
 * instrument's own currency, then converted to the account currency.
 *
 * The engine never invents a rate. When two currencies differ and no rate is
 * supplied, `resolveFxFactor` returns null and the caller turns that into a
 * No Trade / Calculation Unavailable result — silently guessing an FX rate
 * would misstate real money at risk.
 */

import { Decimal } from "./rounding";

export type FxResolution =
  | { ok: true; factor: Decimal; assumed: boolean }
  | { ok: false; from: string; to: string };

/**
 * Factor to multiply a `from`-currency amount by to get a `to`-currency amount.
 * - same currency => 1 (no rate needed)
 * - different currencies => the supplied `rate` (from → to)
 * - different currencies with no rate => unresolved
 */
export function resolveFxFactor(
  from: string,
  to: string,
  rate?: number
): FxResolution {
  const f = from.trim().toUpperCase();
  const t = to.trim().toUpperCase();

  if (!f || !t) return { ok: false, from, to };
  if (f === t) return { ok: true, factor: new Decimal(1), assumed: false };

  if (rate != null && Number.isFinite(rate) && rate > 0) {
    return { ok: true, factor: new Decimal(rate), assumed: false };
  }

  return { ok: false, from: f, to: t };
}
