import crypto from "node:crypto";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { tierForJoinDate } from "@/lib/config/legacy-tiers";

export const runtime = "nodejs";

/**
 * Bot-facing join recorder.
 *
 * Telegram's Bot API cannot be queried for join dates or a member list, so the
 * only way to know when someone joined is to capture the `chat_member` update
 * at the moment it happens. The community bot posts here whenever someone
 * joins the free group, which keeps the loyalty registry accurate from now on
 * (historical members are seeded separately from a chat export).
 *
 * Deliberately never downgrades: an existing earlier join date always wins.
 */

function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  const sharedSecret = process.env.TELEGRAM_BOT_VERIFY_SECRET;
  const prisma = getPrismaClient();
  if (!sharedSecret || !prisma) {
    return jsonResponse(503, { ok: false, reason: "not_configured" });
  }
  if (!secretsMatch(request.headers.get("x-kira-bot-secret"), sharedSecret)) {
    return jsonResponse(401, { ok: false, reason: "unauthorized" });
  }

  const body = (await request.json().catch(() => null)) as {
    telegramUserId?: unknown;
    telegramUsername?: unknown;
    displayName?: unknown;
    joinedAt?: unknown;
    inviteLinkName?: unknown;
  } | null;

  const telegramUserId =
    typeof body?.telegramUserId === "string" || typeof body?.telegramUserId === "number"
      ? String(body.telegramUserId)
      : "";
  if (!telegramUserId) return jsonResponse(400, { ok: false, reason: "missing_user_id" });

  const joinedAt = body?.joinedAt ? new Date(String(body.joinedAt)) : new Date();
  if (Number.isNaN(joinedAt.getTime())) {
    return jsonResponse(400, { ok: false, reason: "bad_date" });
  }

  const telegramUsername =
    typeof body?.telegramUsername === "string" ? body.telegramUsername.slice(0, 64) : null;
  const displayName =
    typeof body?.displayName === "string" ? body.displayName.slice(0, 120) : null;
  const inviteLinkName =
    typeof body?.inviteLinkName === "string" ? body.inviteLinkName.slice(0, 120) : null;

  const existing = await prisma.legacyMember.findUnique({ where: { telegramUserId } });

  // Someone who left and rejoined keeps their original (earlier) join date.
  if (existing && existing.joinedAt <= joinedAt) {
    await prisma.legacyMember.update({
      where: { telegramUserId },
      data: {
        telegramUsername: telegramUsername ?? existing.telegramUsername,
        displayName: displayName ?? existing.displayName,
        inviteLinkName: inviteLinkName ?? existing.inviteLinkName,
      },
    });
    return jsonResponse(200, { ok: true, recorded: false, reason: "earlier_join_kept" });
  }

  const tier = tierForJoinDate(joinedAt);

  await prisma.legacyMember.upsert({
    where: { telegramUserId },
    create: {
      telegramUserId,
      telegramUsername,
      displayName,
      joinedAt,
      tier,
      inviteLinkName,
      source: "chat_member",
    },
    update: {
      telegramUsername: telegramUsername ?? existing?.telegramUsername,
      displayName: displayName ?? existing?.displayName,
      joinedAt,
      tier,
      inviteLinkName: inviteLinkName ?? existing?.inviteLinkName,
      source: "chat_member",
    },
  });

  return jsonResponse(200, { ok: true, recorded: true, tier });
}
