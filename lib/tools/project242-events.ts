/**
 * Project 242 event interface — STRUCTURE ONLY.
 *
 * Project 242 (behavioural risk analysis, trade scoring, etc.) is out of scope
 * for this assignment. This module defines the event *shape* the calculator
 * will one day emit, and a single seam (`emitProject242Event`) where that
 * dispatch will live. Today the seam is a no-op: it neither interprets nor
 * forwards anything. Building it now keeps the calculator forward-compatible
 * without pulling any Project 242 behaviour into the MVP.
 */

import type { CalculationResult } from "@/lib/lot-sizing-engine/types";

export type Project242EventType =
  | "LOT_SIZE_CALCULATED"
  | "NO_TRADE_RETURNED"
  | "BIG_MODE_SELECTED"
  | "CALCULATION_REPEATED"
  | "RISK_SETTING_CHANGED"
  | "BROKER_MINIMUM_EXCEEDED"
  | "HIGH_MARGIN_WARNING";

export interface Project242Event {
  eventType: Project242EventType;
  userId: string | null;
  calculationId: string | null;
  riskMode: string;
  recommendedPosition: number | null;
  status: CalculationResult["status"];
  requestedAt: string;
}

/**
 * Derives the events a single calculation would raise. Pure and side-effect
 * free — it only classifies, it does not act on the classification (that is
 * Project 242's job, later).
 */
export function deriveEventsFromResult(
  result: CalculationResult,
  userId: string | null,
  calculationId: string | null
): Project242Event[] {
  const at = result.timestamp;
  const base = {
    userId,
    calculationId,
    riskMode: result.riskModeId,
    recommendedPosition: result.recommendedPosition,
    status: result.status,
    requestedAt: at,
  };

  const events: Project242Event[] = [{ eventType: "LOT_SIZE_CALCULATED", ...base }];

  if (result.status === "no_trade") events.push({ eventType: "NO_TRADE_RETURNED", ...base });
  if (result.riskModeId === "big") events.push({ eventType: "BIG_MODE_SELECTED", ...base });
  if (result.rejectionReasons.some((r) => /minimum/i.test(r)))
    events.push({ eventType: "BROKER_MINIMUM_EXCEEDED", ...base });
  if (result.warnings.some((w) => /margin usage/i.test(w)))
    events.push({ eventType: "HIGH_MARGIN_WARNING", ...base });

  return events;
}

/**
 * The dispatch seam. Intentionally a no-op for the MVP — Project 242 is not
 * built in this assignment. When it exists, forward `events` here (queue, HTTP,
 * etc.); no call site needs to change.
 */
export async function emitProject242Events(events: Project242Event[]): Promise<void> {
  // no-op by design — Project 242 is out of scope for this assignment. The
  // `events` are intentionally not dispatched yet; this reference keeps the
  // parameter live so the seam's signature is the real, future one.
  void events.length;
}
