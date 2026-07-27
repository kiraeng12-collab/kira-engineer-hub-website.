/**
 * Margin estimation. Leverage lives HERE and nowhere in the risk sizing — it
 * answers only "is there enough margin for the risk-sized position?", never
 * "how big should the position be?".
 */

import type { InstrumentSpec } from "./types";
import { Decimal } from "./rounding";

/**
 * Required margin for a 1.00-lot position, generic notional-÷-leverage method.
 *
 *   notional = contractSize × entryPrice
 *   margin   = notional / leverage
 *
 * The result is denominated in the instrument's PROFIT (quote) currency: for
 * every catalog instrument `contractSize × price` yields the notional in the
 * quote currency (100 oz × gold-USD price = USD notional; 100,000 × USDJPY
 * price = JPY notional; index contractSize 1 × price = quote-currency
 * notional). The caller converts profit → account with the same FX factor used
 * for the loss leg, so no second, possibly-missing rate is ever required.
 */
export function marginPerLotInProfitCurrency(
  spec: InstrumentSpec,
  entryPrice: Decimal.Value,
  leverage: Decimal.Value
): Decimal {
  const notional = new Decimal(spec.contractSize).times(entryPrice);
  const lev = new Decimal(leverage);
  if (lev.lte(0)) return notional; // guarded upstream; degrade to full notional
  return notional.div(lev);
}

/**
 * Largest position (lots) whose required margin stays within `maxMarginAccount`
 * (the mode's margin ceiling expressed in the account currency).
 */
export function marginLimitedPosition(
  maxMarginAccount: Decimal.Value,
  marginPerLotAccount: Decimal.Value
): Decimal {
  const perLot = new Decimal(marginPerLotAccount);
  if (perLot.lte(0)) return new Decimal(0);
  return new Decimal(maxMarginAccount).div(perLot);
}
