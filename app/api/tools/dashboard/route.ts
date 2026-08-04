/**
 * VIP Live Dashboard data. Returns the currently-running trades and a short
 * list of recently-closed ones. Gated on a valid VIP key AND VIP-group
 * membership (resolveDashboardAccess).
 */

import { jsonResponse } from "@/lib/api-utils";
import { resolveDashboardAccess } from "@/lib/tools/dashboard-access";
import { listOpenTrades, listRecentClosed } from "@/lib/trades/store";
import { buildSignalCalculatorUrl } from "@/lib/tools/signal-prefill";

export const runtime = "nodejs";

type TradeRow = Awaited<ReturnType<typeof listOpenTrades>>[number];

/** A signed "Calculate my lot" deep link for a running trade, if signing is set up. */
function calcUrlFor(t: TradeRow): string | null {
  const secret = process.env.LOTSIZE_SIGNAL_SECRET;
  if (!secret || t.entryMin == null || t.stopLoss == null) return null;
  const entryMax = t.entryMax ?? t.entryMin;
  return buildSignalCalculatorUrl(
    {
      signalId: t.id,
      instrument: t.symbol,
      direction: t.direction as "BUY" | "SELL",
      entryType: entryMax !== t.entryMin ? "RANGE" : "SINGLE",
      entryMinimum: t.entryMin,
      entryMaximum: entryMax,
      stopLoss: t.stopLoss,
    },
    secret,
    "https://www.kiraengineerhub.com/tools/lot-sizing-calculator/telegram"
  );
}

function toDto(t: TradeRow) {
  return {
    id: t.id,
    symbol: t.symbol,
    direction: t.direction,
    size: t.size,
    entryMin: t.entryMin,
    entryMax: t.entryMax,
    stopLoss: t.stopLoss,
    originalStopLoss: t.originalStopLoss,
    movedToBE: t.movedToBE,
    takeProfits: t.takeProfits,
    tpHitCount: t.tpHitCount,
    status: t.status,
    outcome: t.outcome,
    openedAt: t.openedAt,
    closedAt: t.closedAt,
  };
}

export async function GET(request: Request): Promise<Response> {
  const access = await resolveDashboardAccess(request);
  if (!access.ok) return jsonResponse(access.status, { locked: true, message: access.message });

  const [open, closed] = await Promise.all([
    listOpenTrades(access.prisma),
    listRecentClosed(access.prisma),
  ]);

  return jsonResponse(200, {
    running: open.map((t) => ({ ...toDto(t), calcUrl: calcUrlFor(t) })),
    closed: closed.map(toDto),
    serverTime: new Date().toISOString(),
  });
}
