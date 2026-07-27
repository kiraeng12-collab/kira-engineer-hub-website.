/**
 * VIP persistence for the Lot Sizing Calculator: saved account profiles and
 * calculation history.
 *
 * Every DB call is wrapped so the feature degrades gracefully if the
 * `20260727000000_lot_sizing_calculator` migration has not yet been applied to
 * the database — a missing table must never break the (stateless, free)
 * calculator itself. Reads return empty; writes are best-effort and swallow the
 * "relation does not exist" error, logging it once.
 */

import type { PrismaClient, Prisma } from "@/lib/generated/prisma";
import type { CalculationInput, CalculationResult } from "@/lib/lot-sizing-engine/types";
import { deriveEventsFromResult, emitProject242Events } from "./project242-events";
import { RISK_MODES_VERSION } from "@/lib/config/risk-modes";

const MISSING_TABLE = /relation .* does not exist|table .* does not exist/i;

function isMissingTable(err: unknown): boolean {
  return err instanceof Error && MISSING_TABLE.test(err.message);
}

// ---- Saved account profiles ----

export type ProfileInput = {
  label: string;
  accountCurrency: string;
  leverage: number;
  brokerName?: string | null;
  accountType?: string | null;
  defaultEquity?: number | null;
  defaultRiskMode?: string | null;
};

const MAX_PROFILES_PER_USER = 20;

export async function listProfiles(prisma: PrismaClient, userId: string) {
  try {
    return await prisma.tradingAccountProfile.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  } catch (err) {
    if (isMissingTable(err)) return [];
    throw err;
  }
}

export type CreateProfileResult =
  | { ok: true; profile: { id: string } }
  | { ok: false; reason: "limit_reached" | "unavailable" };

export async function createProfile(
  prisma: PrismaClient,
  userId: string,
  input: ProfileInput
): Promise<CreateProfileResult> {
  try {
    const count = await prisma.tradingAccountProfile.count({ where: { userId } });
    if (count >= MAX_PROFILES_PER_USER) return { ok: false, reason: "limit_reached" };
    const profile = await prisma.tradingAccountProfile.create({
      data: {
        userId,
        label: input.label,
        accountCurrency: input.accountCurrency,
        leverage: input.leverage,
        brokerName: input.brokerName ?? null,
        accountType: input.accountType ?? null,
        defaultEquity: input.defaultEquity ?? null,
        defaultRiskMode: input.defaultRiskMode ?? null,
      },
      select: { id: true },
    });
    return { ok: true, profile };
  } catch (err) {
    if (isMissingTable(err)) return { ok: false, reason: "unavailable" };
    throw err;
  }
}

/** Deletes a profile, but only if it belongs to `userId` (guards against IDOR). */
export async function deleteProfile(prisma: PrismaClient, userId: string, id: string): Promise<boolean> {
  try {
    const result = await prisma.tradingAccountProfile.deleteMany({ where: { id, userId } });
    return result.count > 0;
  } catch (err) {
    if (isMissingTable(err)) return false;
    throw err;
  }
}

// ---- Calculation history ----

export async function saveCalculation(
  prisma: PrismaClient,
  userId: string,
  input: CalculationInput,
  result: CalculationResult
): Promise<string | null> {
  try {
    const row = await prisma.lotSizeCalculation.create({
      data: {
        userId,
        calculationVersion: result.calculationVersion,
        riskMode: result.riskModeId,
        riskModeVersion: RISK_MODES_VERSION,
        instrumentSymbol: result.instrumentSymbol,
        instrumentSpecVersion: result.instrumentSpecVersion,
        direction: result.direction,
        status: result.status,
        accountCurrency: result.accountCurrency,
        equity: result.equityUsed,
        recommendedPosition: result.recommendedPosition,
        normalRiskAmount: result.normalRiskAmount,
        requiredMargin: result.requiredMargin,
        inputs: sanitiseInput(input) as Prisma.InputJsonValue,
        outputs: result as unknown as Prisma.InputJsonValue,
      },
      select: { id: true },
    });

    // Forward-compat: derive Project 242 events (no-op dispatch for now).
    await emitProject242Events(deriveEventsFromResult(result, userId, row.id));

    return row.id;
  } catch (err) {
    if (isMissingTable(err)) return null; // migration not applied yet
    // Never let a history-write failure break the calculation response.
    console.error("saveCalculation failed:", err);
    return null;
  }
}

export async function listHistory(prisma: PrismaClient, userId: string, limit = 25) {
  try {
    return await prisma.lotSizeCalculation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
      select: {
        id: true,
        createdAt: true,
        status: true,
        riskMode: true,
        instrumentSymbol: true,
        direction: true,
        accountCurrency: true,
        equity: true,
        recommendedPosition: true,
        normalRiskAmount: true,
        requiredMargin: true,
      },
    });
  } catch (err) {
    if (isMissingTable(err)) return [];
    throw err;
  }
}

/** Strips nothing sensitive today (the input carries no secrets), but keeps a
 * single choke point so future fields can be filtered before persistence. */
function sanitiseInput(input: CalculationInput): Record<string, unknown> {
  return { ...input } as Record<string, unknown>;
}
