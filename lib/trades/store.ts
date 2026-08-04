/**
 * Trade ingestion + read layer for the VIP Live Dashboard.
 *
 * Channel posts flow in through the Telegram webhook: a top-level post becomes
 * a Trade (when it parses as a signal); a REPLY to a signal updates that exact
 * trade (TP1/TP2/SL/BE), linked by the replied-to message id. Reads power the
 * dashboard (running now + recently closed).
 *
 * Every DB call tolerates the Trade table not existing yet (pre-migration) so a
 * webhook delivery can never 500 the bot.
 */

import type { PrismaClient } from "@/lib/generated/prisma";
import { parseTradeSignal, parseTradeUpdate, type ParsedUpdate } from "./parser";

const MISSING_TABLE = /relation .* does not exist|table .* does not exist/i;
function isMissingTable(err: unknown): boolean {
  return err instanceof Error && MISSING_TABLE.test(err.message);
}

/** Detects "wait confirmation" wording -> the trade isn't entered yet. */
function initialStatus(text: string): "pending" | "running" {
  return /wait\s*confirmation/i.test(text) ? "pending" : "running";
}

export type IngestInput = {
  channelChatId: string;
  messageId: number;
  text: string;
  replyToMessageId?: number | null;
  isEdit?: boolean;
};

export type IngestResult =
  | { action: "created" | "updated_signal" | "updated_status"; tradeId: string }
  | { action: "ignored"; reason: string };

export async function ingestChannelPost(prisma: PrismaClient, input: IngestInput): Promise<IngestResult> {
  try {
    // A reply to a signal is an update (TP/SL/BE/close).
    if (input.replyToMessageId) {
      const parent = await prisma.trade.findUnique({
        where: { channelChatId_channelMessageId: { channelChatId: input.channelChatId, channelMessageId: String(input.replyToMessageId) } },
      });
      if (!parent) return { action: "ignored", reason: "reply to a non-trade message" };

      const update = parseTradeUpdate(input.text);
      if (!update) return { action: "ignored", reason: "reply is not a recognised update" };

      await prisma.trade.update({ where: { id: parent.id }, data: computeUpdate(parent, update) });
      return { action: "updated_status", tradeId: parent.id };
    }

    // A top-level post: a new signal, or an edit of one.
    const signal = parseTradeSignal(input.text);
    if (!signal) return { action: "ignored", reason: "not a trade signal" };

    const existing = await prisma.trade.findUnique({
      where: { channelChatId_channelMessageId: { channelChatId: input.channelChatId, channelMessageId: String(input.messageId) } },
    });

    if (existing) {
      // Edit of a known signal: refresh the levels, keep the lifecycle state.
      await prisma.trade.update({
        where: { id: existing.id },
        data: {
          symbol: signal.symbol, direction: signal.direction, size: signal.size,
          entryMin: signal.entryMin, entryMax: signal.entryMax,
          stopLoss: existing.movedToBE ? existing.stopLoss : signal.stopLoss,
          takeProfits: signal.takeProfits, rawText: input.text,
        },
      });
      return { action: "updated_signal", tradeId: existing.id };
    }

    const created = await prisma.trade.create({
      data: {
        channelChatId: input.channelChatId, channelMessageId: String(input.messageId),
        symbol: signal.symbol, direction: signal.direction, size: signal.size,
        entryMin: signal.entryMin, entryMax: signal.entryMax,
        stopLoss: signal.stopLoss, originalStopLoss: signal.stopLoss,
        takeProfits: signal.takeProfits, status: initialStatus(input.text), rawText: input.text,
      },
    });
    return { action: "created", tradeId: created.id };
  } catch (err) {
    if (isMissingTable(err)) return { action: "ignored", reason: "trades table not migrated yet" };
    throw err;
  }
}

type TradeRow = NonNullable<Awaited<ReturnType<PrismaClient["trade"]["findUnique"]>>>;

/** Computes the field patch for a lifecycle update on a trade. */
function computeUpdate(trade: TradeRow, update: ParsedUpdate): Record<string, unknown> {
  const now = new Date();
  switch (update.type) {
    case "tp1":
      return { tpHitCount: Math.max(trade.tpHitCount, 1), status: "running" };
    case "tp2":
      return { tpHitCount: Math.max(trade.tpHitCount, 2), status: "closed", outcome: "tp2", closedAt: now };
    case "tp": {
      const n = trade.tpHitCount + 1;
      const total = trade.takeProfits.length || 2;
      if (n >= total) return { tpHitCount: n, status: "closed", outcome: `tp${n}`, closedAt: now };
      return { tpHitCount: n, status: "running" };
    }
    case "sl":
      return { status: "closed", outcome: "sl", closedAt: now };
    case "be": {
      const be = update.price ?? trade.entryMin ?? trade.entryMax ?? trade.stopLoss;
      return {
        movedToBE: true,
        originalStopLoss: trade.originalStopLoss ?? trade.stopLoss,
        stopLoss: be,
        status: trade.status === "pending" ? "running" : trade.status,
      };
    }
    case "enter":
      // Order filled / activated — a pending setup is now live.
      return { status: "running" };
    case "cancel":
      // Setup voided before entry — off the board, marked cancelled.
      return { status: "closed", outcome: "cancelled", closedAt: now };
    case "close":
      return { status: "closed", outcome: "manual", closedAt: now };
  }
}

// ---- Reads for the dashboard ----

/**
 * Start of the current trading week — the most recent Monday 00:00. The closed
 * list resets to this each Monday so the board shows THIS week's results, not an
 * ever-growing history. Running trades are never reset (they're live).
 * DASHBOARD_WEEK_OFFSET_HOURS shifts the Monday-midnight boundary to the desired
 * timezone (e.g. 3 for +03:00); defaults to UTC.
 */
export function startOfTradingWeek(now: Date = new Date()): Date {
  const offsetHours = Number(process.env.DASHBOARD_WEEK_OFFSET_HOURS || 0);
  const shifted = new Date(now.getTime() + offsetHours * 3_600_000);
  const daysSinceMonday = (shifted.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  const mondayMidnight = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate() - daysSinceMonday
  );
  return new Date(mondayMidnight - offsetHours * 3_600_000);
}

export async function listOpenTrades(prisma: PrismaClient) {
  try {
    return await prisma.trade.findMany({
      where: { status: { in: ["pending", "running"] } },
      orderBy: { openedAt: "desc" },
    });
  } catch (err) {
    if (isMissingTable(err)) return [];
    throw err;
  }
}

/** Trades closed since the start of the current trading week (Monday reset). */
export async function listRecentClosed(prisma: PrismaClient, limit = 60) {
  try {
    return await prisma.trade.findMany({
      where: { status: "closed", closedAt: { gte: startOfTradingWeek() } },
      orderBy: { closedAt: "desc" },
      take: limit,
    });
  } catch (err) {
    if (isMissingTable(err)) return [];
    throw err;
  }
}
