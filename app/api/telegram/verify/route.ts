import crypto from "node:crypto";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { getTelegramConfig, createSingleUseInviteLink } from "@/lib/telegram/client";
import { hashToken, isExpired } from "@/lib/auth/tokens";
import { getActiveEntitlementKeys } from "@/lib/entitlements/service";

export const runtime = "nodejs";

/**
 * Bot-facing access-key redemption.
 *
 * The KIRA community bot runs in polling mode on its own host, so Telegram
 * updates cannot also be delivered to a webhook here (a bot token is polling
 * OR webhook, never both). Instead the bot receives `/start <accessKey>`
 * itself and calls this endpoint server-to-server with a shared secret.
 *
 * This endpoint is the authority: it validates the key, links the Telegram
 * account, checks entitlements, and returns a single-use invite link for the
 * bot to deliver.
 */

const INVITE_LINK_TTL_SECONDS = 15 * 60;

function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  // Explicit kill-switch: the whole paid-access automation stays dormant until
  // this is set to "true" (planned for 1 August 2026).
  if (process.env.PAYMENT_AUTOMATION_ENABLED !== "true") {
    return jsonResponse(503, { ok: false, reason: "automation_disabled" });
  }

  const sharedSecret = process.env.TELEGRAM_BOT_VERIFY_SECRET;
  const prisma = getPrismaClient();
  const config = getTelegramConfig();
  if (!sharedSecret || !prisma || !config) {
    return jsonResponse(503, { ok: false, reason: "not_configured" });
  }

  if (!secretsMatch(request.headers.get("x-kira-bot-secret"), sharedSecret)) {
    return jsonResponse(401, { ok: false, reason: "unauthorized" });
  }

  const body = (await request.json().catch(() => null)) as
    | { accessKey?: unknown; telegramUserId?: unknown; telegramUsername?: unknown }
    | null;

  const accessKey = typeof body?.accessKey === "string" ? body.accessKey.trim() : "";
  const telegramUserId =
    typeof body?.telegramUserId === "string" || typeof body?.telegramUserId === "number"
      ? String(body.telegramUserId)
      : "";
  const telegramUsername =
    typeof body?.telegramUsername === "string" ? body.telegramUsername.slice(0, 64) : null;

  if (!accessKey || !telegramUserId) {
    return jsonResponse(400, { ok: false, reason: "missing_fields" });
  }

  const user = await prisma.user.findUnique({
    where: { telegramInviteTokenHash: hashToken(accessKey) },
  });

  if (!user || !user.telegramInviteTokenExpiresAt || isExpired(user.telegramInviteTokenExpiresAt)) {
    return jsonResponse(200, { ok: false, reason: "invalid_or_expired" });
  }

  // The key is valid — but access still depends on a live entitlement.
  const entitlements = await getActiveEntitlementKeys(prisma, user.id);
  if (!entitlements.includes("vip_telegram")) {
    return jsonResponse(200, { ok: false, reason: "no_active_membership" });
  }

  // Refuse to move a Telegram account that already belongs to someone else.
  const alreadyLinked = await prisma.user.findUnique({ where: { telegramUserId } });
  if (alreadyLinked && alreadyLinked.id !== user.id) {
    return jsonResponse(200, { ok: false, reason: "telegram_already_linked" });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      telegramUserId,
      telegramUsername,
      telegramLinkedAt: new Date(),
      telegramRemovedAt: null,
      // Single use: burn the key immediately.
      telegramInviteTokenHash: null,
      telegramInviteTokenExpiresAt: null,
    },
  });

  let inviteLink: string | null = null;
  try {
    inviteLink = await createSingleUseInviteLink(
      config.botToken,
      config.groupChatId,
      INVITE_LINK_TTL_SECONDS
    );
  } catch {
    // Linked successfully but the invite failed — the bot tells them to contact
    // support rather than silently doing nothing.
    return jsonResponse(200, { ok: true, linked: true, inviteLink: null, entitlements, reason: "invite_failed" });
  }

  return jsonResponse(200, {
    ok: true,
    linked: true,
    inviteLink,
    entitlements,
    name: user.name,
    expiresInMinutes: INVITE_LINK_TTL_SECONDS / 60,
  });
}
