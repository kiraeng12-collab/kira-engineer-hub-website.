/**
 * KIRA risk-mode configuration — the single source of truth for the three
 * risk modes and the engine's global safety tunables.
 *
 * This repository deliberately has no public admin route (see
 * docs/early-bird-admin-workflow.md); administrator-configurable values live
 * in versioned config modules like this one instead. Change a value here, bump
 * its `version`, and every calculation records which version it used.
 */

import type { RiskMode, RiskModeId } from "@/lib/lot-sizing-engine/types";

/** Bumped whenever any risk-mode value below changes. Stamped into calc rows. */
export const RISK_MODES_VERSION = "2026-07-27.1";

export const riskModes: Record<RiskModeId, RiskMode> = {
  small: {
    id: "small",
    name: "Small — Protected",
    description:
      "Prioritises capital preservation. Recommended for new traders, small accounts, and volatile markets.",
    riskPercent: 0.25,
    stressMultiplier: 2.0,
    maxMarginUsagePercent: 10,
    active: true,
    availableTo: "all",
    version: RISK_MODES_VERSION,
  },
  medium: {
    id: "medium",
    name: "Medium — Balanced",
    description:
      "Balanced risk management for normal trading conditions and experienced traders.",
    riskPercent: 0.5,
    stressMultiplier: 1.75,
    maxMarginUsagePercent: 15,
    active: true,
    availableTo: "all",
    version: RISK_MODES_VERSION,
  },
  big: {
    id: "big",
    name: "Big — Controlled",
    description:
      "A higher, still controlled risk level for experienced traders who knowingly choose it, on accounts with sufficient equity and margin.",
    riskPercent: 1.0,
    stressMultiplier: 1.5,
    maxMarginUsagePercent: 20,
    active: true,
    availableTo: "all",
    version: RISK_MODES_VERSION,
  },
};

export function getRiskMode(id: RiskModeId): RiskMode {
  return riskModes[id];
}

export function isRiskModeId(value: unknown): value is RiskModeId {
  return value === "small" || value === "medium" || value === "big";
}

/** Risk modes a given access tier may use. */
export function availableRiskModes(access: "free" | "vip"): RiskMode[] {
  return Object.values(riskModes).filter((mode) => {
    if (!mode.active) return false;
    if (mode.availableTo === "all") return true;
    if (access === "vip") return true; // VIP sees free + vip modes
    return mode.availableTo === "free";
  });
}

/**
 * Global engine safety tunables. Kept alongside the risk modes because they
 * shape the same "how conservative are we" decision, and are equally
 * administrator-owned.
 */
export const engineConfig = {
  /** Absolute product-wide lot ceiling, independent of broker maxLot. */
  productMaxLot: 100,

  /**
   * An account below this equity (in the account currency) is treated as
   * "small" for the purpose of the Big-mode strong warning.
   */
  smallAccountEquityThreshold: 2000,

  /**
   * Margin-usage fractions of a mode's `maxMarginUsagePercent`. At/above the
   * caution fraction the result is flagged Caution; at/above the high fraction
   * it is flagged High Risk.
   */
  marginUsageCautionRatio: 0.8,
  marginUsageHighRatio: 0.95,

  /**
   * If the broker's minimum lot would, at the stressed stop distance, consume
   * at least this fraction of the risk budget, flag Caution — the minimum is
   * close to breaching the selected risk limit.
   */
  brokerMinRiskCautionRatio: 0.8,

  /** Engine calculation version, stamped into every result. */
  calculationVersion: "1.0.0",
} as const;
