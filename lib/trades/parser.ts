/**
 * Tolerant parser for KIRA VIP-channel trade posts.
 *
 * Posts are human-written and their layout varies, but the *fields* are
 * consistent: symbol + direction, size, entry range, stop-loss, TP1/TP2. The
 * parser extracts by label rather than position, so line breaks and ordering
 * don't matter. Anything it can't confidently read as a trade returns null and
 * is simply ignored (the admin override covers the rare miss).
 *
 * Signal updates are posted as REPLIES to the original signal, so they are
 * short ("TP1", "SL", "BE", "TP2 hit"). `parseTradeUpdate` classifies those.
 */

export type Direction = "BUY" | "SELL";
export type TradeSize = "big" | "medium" | "small";

export interface ParsedSignal {
  symbol: string;
  direction: Direction;
  size: TradeSize | null;
  entryMin: number | null;
  entryMax: number | null;
  stopLoss: number | null;
  takeProfits: number[];
}

export type ParsedUpdate =
  | { type: "tp1" }
  | { type: "tp2" }
  | { type: "tp" } // an unnumbered target hit
  | { type: "sl" }
  | { type: "be"; price: number | null } // stop moved to break-even
  | { type: "close" };

function num(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function normaliseSize(raw: string | undefined): TradeSize | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.startsWith("big")) return "big";
  if (s.startsWith("norm") || s.startsWith("med")) return "medium";
  if (s.startsWith("small")) return "small";
  return null;
}

/**
 * Parses a channel post into a signal, or returns null if it isn't one. A post
 * qualifies as a trade when it has a symbol + direction and at least an entry
 * or a stop-loss — enough to be a real setup rather than chatter.
 */
export function parseTradeSignal(text: string): ParsedSignal | null {
  if (!text) return null;
  const t = text.replace(/ /g, " "); // normalise non-breaking spaces

  // Symbol + direction, e.g. "XAUUSD-BUY", "XAUUSD - sell", "US30 BUY".
  const dir = t.match(/\b([A-Z0-9]{3,12})\s*[-–—/]?\s*(BUY|SELL)\b/i);
  if (!dir) return null;
  const symbol = dir[1].toUpperCase();
  const direction = dir[2].toUpperCase() as Direction;

  const size = normaliseSize(t.match(/\bSIZE\s*[:=]?\s*([A-Za-z]+)/i)?.[1]);

  // Entry: single or range ("Entry range: 4015", "entry 4088-4092", "4088 - 4092").
  const entry = t.match(/\bentry(?:\s*range)?\s*[:=]?\s*([\d.,]+)\s*(?:[-–—]|to)?\s*([\d.,]+)?/i);
  let entryMin = num(entry?.[1]);
  let entryMax = num(entry?.[2]) ?? entryMin;
  if (entryMin !== null && entryMax !== null && entryMin > entryMax) {
    [entryMin, entryMax] = [entryMax, entryMin];
  }

  const stopLoss = num(t.match(/\b(?:stop[\s-]*loss|s\.?\s*l)\b\s*[:=]?\s*([\d.,]+)/i)?.[1]);

  // Take profits: collect all "TP n: price" / "take profit n price" in order.
  const takeProfits: number[] = [];
  // The optional TP index is a LONE digit (not followed by another digit), so
  // "TP1 4025" reads index 1 / price 4025, while "TP 44300" reads price 44300.
  const tpRe = /\b(?:take\s*profit|tp)\s*(?:\d(?!\d))?\s*[:=]?\s*([\d.,]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = tpRe.exec(t)) !== null) {
    const v = num(m[1]);
    if (v !== null) takeProfits.push(v);
  }

  // Require a symbol/direction plus at least one concrete level.
  if (entryMin === null && stopLoss === null && takeProfits.length === 0) return null;

  return { symbol, direction, size, entryMin, entryMax, stopLoss, takeProfits };
}

/**
 * Classifies a short reply as a signal update. Order matters: break-even is
 * checked before stop-loss (so "move SL to BE" reads as BE, not SL), and TP2
 * before TP1 before a generic target.
 */
export function parseTradeUpdate(text: string): ParsedUpdate | null {
  if (!text) return null;
  const t = text.toLowerCase();

  if (/\bbe\b|break[\s-]*even|breakeven/.test(t)) {
    const price = num(t.match(/([\d.,]+)/)?.[1]);
    return { type: "be", price };
  }
  if (/\btp\s*2\b|take\s*profit\s*2|second\s*target/.test(t)) return { type: "tp2" };
  if (/\btp\s*1\b|take\s*profit\s*1|first\s*target/.test(t)) return { type: "tp1" };
  if (/\bsl\b|stop[\s-]*loss|stopped|stop[\s-]*out/.test(t)) return { type: "sl" };
  if (/\btp\b|take\s*profit|target\s*(?:hit|reached|done)|profit\s*secured/.test(t)) return { type: "tp" };
  if (/\bclosed?\b|book(?:ed)?|cancel/.test(t)) return { type: "close" };

  return null;
}
