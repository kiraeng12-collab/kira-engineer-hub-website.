/**
 * Entry-range resolution for KIRA signals. When a signal gives an entry range
 * (e.g. 4050–4055), the calculator sizes on the WORST case by default so the
 * result never understates risk:
 *   - Buy  -> the highest price in the range (widest stop, largest loss)
 *   - Sell -> the lowest  price in the range
 */

import type { Direction } from "./types";

export type EntryRangeMode = "worst" | "average" | "best";

export function resolveEntryPrice(
  direction: Direction,
  min: number,
  max: number,
  mode: EntryRangeMode = "worst"
): number {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  if (mode === "average") return (low + high) / 2;

  if (direction === "BUY") {
    // A higher entry means a wider stop distance to a fixed stop below.
    return mode === "worst" ? high : low;
  }
  // SELL: a lower entry means a wider stop distance to a fixed stop above.
  return mode === "worst" ? low : high;
}
