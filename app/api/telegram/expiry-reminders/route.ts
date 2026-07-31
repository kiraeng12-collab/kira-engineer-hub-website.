import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { getTelegramConfig, sendTelegramMessage } from "@/lib/telegram/client";

export const runtime = "nodejs";

// How many days out to warn about. A member expiring inside this window is a
// renewal the owner can still save with a nudge.
const WINDOW_DAYS = 3;

/**
 * Daily "expiring soon" heads-up. DMs the owner one digest of the paid
 * (card/crypto) memberships lapsing in the next few days, so they can nudge a
 * renewal BEFORE access drops. Owner-only, Cron-authorized, and a no-op when
 * nothing is expiring or alerts aren't configured. Migration grandfathers
 * (source "admin_grant") are deliberately excluded - those are handled by the
 * re-subscribe campaign, not ongoing billing.
 */
async function run(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return jsonResponse(503, { ok: false, reason: "not_configured" });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return jsonResponse(401, { ok: false, reason: "unauthorized" });
  }

  const prisma = getPrismaClient();
  if (!prisma) return jsonResponse(503, { ok: false, reason: "no_db" });

  const ownerChatId = (process.env.TELEGRAM_OWNER_CHAT_ID || "").trim();
  const config = getTelegramConfig();
  if (!ownerChatId || !config) {
    return jsonResponse(200, { ok: true, skipped: "owner alerts not configured" });
  }

  const now = new Date();
  const until = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const soon = await prisma.entitlement.findMany({
    where: {
      status: "active",
      source: { in: ["stripe", "crypto"] },
      currentPeriodEnd: { gte: now, lte: until },
    },
    select: {
      product: true,
      currentPeriodEnd: true,
      user: { select: { email: true, name: true } },
    },
    orderBy: { currentPeriodEnd: "asc" },
  });

  if (soon.length === 0) return jsonResponse(200, { ok: true, expiringSoon: 0 });

  const lines = soon.map((e) => {
    const who = e.user?.name ? `${e.user.name} (${e.user.email})` : e.user?.email || "unknown";
    const when = e.currentPeriodEnd ? e.currentPeriodEnd.toISOString().slice(0, 10) : "?";
    return `• ${who} — ${e.product} — ${when}`;
  });
  const text = `⏳ Expiring in the next ${WINDOW_DAYS} days (${soon.length})\n\n${lines.join("\n")}\n\nNudge them to renew before access lapses.`;

  await sendTelegramMessage(config.botToken, ownerChatId, text).catch((e) =>
    console.error("expiry heads-up failed", e instanceof Error ? e.message : e)
  );

  return jsonResponse(200, { ok: true, expiringSoon: soon.length });
}

export async function GET(request: Request): Promise<Response> {
  return run(request);
}
export async function POST(request: Request): Promise<Response> {
  return run(request);
}
