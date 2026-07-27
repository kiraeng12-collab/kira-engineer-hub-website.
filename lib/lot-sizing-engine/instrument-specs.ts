/**
 * Resolves the effective instrument specification for a calculation by merging
 * a user/broker override over the catalog record, then validating that every
 * field the engine needs is present and sane.
 *
 * If the catalog has no record and the override is incomplete, resolution
 * fails — the engine must not guess contract specifications.
 */

import type { InstrumentSpec, CalculationInput } from "./types";
import { findInstrument } from "@/lib/config/instruments";

export type SpecResolution =
  | { ok: true; spec: InstrumentSpec; usedOverride: boolean }
  | { ok: false; reason: string; missing: string[] };

/** Numeric fields that must be present and positive for a valid calculation. */
const REQUIRED_POSITIVE: (keyof InstrumentSpec)[] = [
  "tickSize",
  "tickValue",
  "minLot",
  "maxLot",
  "volumeStep",
];

export function resolveInstrumentSpec(input: CalculationInput): SpecResolution {
  const catalog = findInstrument(input.instrumentSymbol);
  const override = input.brokerSpecOverride;

  if (!catalog && !override) {
    return {
      ok: false,
      reason: "Instrument specifications are not available for this symbol.",
      missing: ["symbol"],
    };
  }

  // Base fields, defaulting the descriptive ones so a from-scratch override
  // (no catalog match) still yields a complete record.
  const base: Partial<InstrumentSpec> = catalog ? { ...catalog } : {};
  const merged: Partial<InstrumentSpec> = {
    symbol: (override?.symbol ?? base.symbol ?? input.instrumentSymbol).toUpperCase(),
    displayName: override?.displayName ?? base.displayName ?? input.instrumentSymbol.toUpperCase(),
    aliases: override?.aliases ?? base.aliases ?? [],
    assetClass: override?.assetClass ?? base.assetClass ?? "other",
    contractSize: override?.contractSize ?? base.contractSize,
    tickSize: override?.tickSize ?? base.tickSize,
    tickValue: override?.tickValue ?? base.tickValue,
    pipSize: override?.pipSize ?? base.pipSize,
    minLot: override?.minLot ?? base.minLot,
    maxLot: override?.maxLot ?? base.maxLot,
    volumeStep: override?.volumeStep ?? base.volumeStep,
    profitCurrency: (override?.profitCurrency ?? base.profitCurrency ?? "").toUpperCase() || undefined,
    marginCurrency:
      (override?.marginCurrency ?? base.marginCurrency ?? override?.profitCurrency ?? base.profitCurrency ?? "").toUpperCase() ||
      undefined,
    marginMethod: override?.marginMethod ?? base.marginMethod ?? "notional_leverage",
    dataSource: override ? (catalog ? `${catalog.dataSource}+override` : "user-override") : base.dataSource ?? "unknown",
    lastVerified: base.lastVerified ?? "unverified",
    specVersion: override ? `${base.specVersion ?? "none"}+override` : base.specVersion ?? "unknown",
  };

  const missing: string[] = [];
  for (const field of REQUIRED_POSITIVE) {
    const v = merged[field];
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) missing.push(field);
  }
  // contractSize is required for margin; tick-value carries the loss math, but
  // without contractSize we cannot estimate notional / margin.
  if (typeof merged.contractSize !== "number" || !Number.isFinite(merged.contractSize) || merged.contractSize <= 0) {
    missing.push("contractSize");
  }
  if (!merged.profitCurrency) missing.push("profitCurrency");

  if (missing.length > 0) {
    return {
      ok: false,
      reason:
        "The broker specifications needed to calculate this instrument are missing. Enter them under Advanced Settings to continue.",
      missing,
    };
  }

  return { ok: true, spec: merged as InstrumentSpec, usedOverride: Boolean(override) };
}
