import crypto from "node:crypto";
import { jsonResponse } from "@/lib/api-utils";
import { getTelegramConfig, membershipChatIds } from "@/lib/telegram/client";

export const runtime = "nodejs";

/**
 * Read-only report of what the DEPLOYED environment actually holds.
 *
 * The launch checker otherwise validates the local .env, which says nothing
 * about production — a variable can be missing, scoped to the wrong
 * environment, or added after the last build, and the only symptom is a
 * feature quietly doing nothing. Protected by the bot shared secret; returns
 * chat ids and switch states, never tokens or keys.
 */

function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  const sharedSecret = process.env.TELEGRAM_BOT_VERIFY_SECRET;
  if (!sharedSecret) return jsonResponse(503, { ok: false, reason: "not_configured" });
  if (!secretsMatch(request.headers.get("x-kira-bot-secret"), sharedSecret)) {
    return jsonResponse(401, { ok: false, reason: "unauthorized" });
  }

  const config = getTelegramConfig();
  return jsonResponse(200, {
    ok: true,
    telegramConfigured: Boolean(config),
    botUsername: config?.botUsername ?? null,
    groupChatId: config?.groupChatId ?? null,
    channelChatId: config?.channelChatId ?? null,
    membershipChatCount: config ? membershipChatIds(config).length : 0,
    checkoutEnabled: process.env.CHECKOUT_ENABLED === "true",
    paymentAutomationEnabled: process.env.PAYMENT_AUTOMATION_ENABLED === "true",
  });
}
