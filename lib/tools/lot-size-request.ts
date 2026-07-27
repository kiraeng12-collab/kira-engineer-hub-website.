/**
 * Parses and normalises an untrusted lot-size request body into a typed
 * CalculationInput, and enforces which fields each access tier may use.
 *
 * Kept separate from the route handler so it can be unit-tested in isolation
 * and reused by the website API and the Telegram Mini App API. Deliberately
 * hand-rolled (matching this repo's validation style) rather than pulling in a
 * new schema dependency — the engine performs the deep financial validation;
 * this layer only coerces types and strips fields the caller isn't allowed to
 * set.
 */

import type { CalculationInput, Direction, InstrumentSpec } from "@/lib/lot-sizing-engine/types";
import { isRiskModeId } from "@/lib/config/risk-modes";

export type AccessTier = "free" | "vip";

export type ParseResult =
  | { ok: true; input: CalculationInput; droppedVipFields: string[] }
  | { ok: false; errors: string[] };

function toNum(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  return Number.isFinite(n) ? n : undefined;
}

function toBool(v: unknown): boolean | undefined {
  if (v === true || v === "true" || v === "on" || v === "1") return true;
  if (v === false || v === "false" || v === "0" || v === "" || v === undefined) return false;
  return undefined;
}

function parseOverride(raw: unknown): (Partial<InstrumentSpec> & { symbol?: string }) | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const spec: Partial<InstrumentSpec> & { symbol?: string } = {};
  const numFields: (keyof InstrumentSpec)[] = [
    "contractSize",
    "tickSize",
    "tickValue",
    "pipSize",
    "minLot",
    "maxLot",
    "volumeStep",
  ];
  for (const f of numFields) {
    const n = toNum(o[f]);
    if (n !== undefined) (spec as Record<string, unknown>)[f] = n;
  }
  if (typeof o.profitCurrency === "string") spec.profitCurrency = o.profitCurrency;
  if (typeof o.marginCurrency === "string") spec.marginCurrency = o.marginCurrency;
  if (typeof o.symbol === "string") spec.symbol = o.symbol;
  return Object.keys(spec).length > 0 ? spec : undefined;
}

export function parseLotSizeRequest(body: unknown, access: AccessTier): ParseResult {
  if (!body || typeof body !== "object") {
    return { ok: false, errors: ["Request body must be a JSON object."] };
  }
  const b = body as Record<string, unknown>;
  const errors: string[] = [];

  const direction = String(b.direction ?? "").toUpperCase();
  if (direction !== "BUY" && direction !== "SELL") errors.push("direction must be BUY or SELL.");

  const riskModeId = String(b.riskModeId ?? "");
  if (!isRiskModeId(riskModeId)) errors.push("riskModeId must be small, medium, or big.");

  const instrumentSymbol = String(b.instrumentSymbol ?? "").trim();
  if (!instrumentSymbol) errors.push("instrumentSymbol is required.");

  const accountCurrency = String(b.accountCurrency ?? "").trim().toUpperCase();

  if (errors.length > 0) return { ok: false, errors };

  const droppedVipFields: string[] = [];

  // VIP-only: splitting the position across multiple entries.
  let numberOfEntries = toNum(b.numberOfEntries);
  if (numberOfEntries !== undefined && numberOfEntries > 1 && access !== "vip") {
    droppedVipFields.push("numberOfEntries");
    numberOfEntries = undefined;
  }

  const input: CalculationInput = {
    equity: toNum(b.equity),
    balance: toNum(b.balance),
    accountCurrency,
    leverage: toNum(b.leverage) ?? NaN,
    instrumentSymbol,
    direction: direction as Direction,
    entryPrice: toNum(b.entryPrice) ?? NaN,
    stopLossPrice: toNum(b.stopLossPrice) ?? NaN,
    riskModeId: riskModeId as CalculationInput["riskModeId"],
    brokerSpecOverride: parseOverride(b.brokerSpecOverride),
    freeMargin: toNum(b.freeMargin),
    numberOfEntries,
    holdThroughNews: toBool(b.holdThroughNews),
    holdOvernight: toBool(b.holdOvernight),
    holdOverWeekend: toBool(b.holdOverWeekend),
    fxRate: toNum(b.fxRate),
    access,
  };

  return { ok: true, input, droppedVipFields };
}
