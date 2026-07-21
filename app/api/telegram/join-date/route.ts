import crypto from "node:crypto";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";

export const runtime = "nodejs";

/**
 * Community "when did I join?" lookup, answered from the LegacyMember
 * registry built by the chat-export import and the live join recorder.
 *
 * Read-only and bot-secret protected. Returns nothing that identifies anyone
 * other than the requesting Telegram id, so it cannot be used to enumerate
 * the community.
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
  if (!sharedSecret || !prisma) return jsonResponse(503, { ok: false, reason: "not_configured" });
  if (!secretsMatch(request.headers.get("x-kira-bot-secret"), sharedSecret)) {
    return jsonResponse(401, { ok: false, reason: "unauthorized" });
  }

  const body = (await request.json().catch(() => null)) as { telegramUserId?: unknown } | null;
  const telegramUserId =
    typeof body?.telegramUserId === "string" || typeof body?.telegramUserId === "number"
      ? String(body.telegramUserId)
      : "";
  if (!telegramUserId) return jsonResponse(400, { ok: false, reason: "missing_fields" });

  const member = await prisma.legacyMember.findUnique({ where: { telegramUserId } });
  if (!member) return jsonResponse(200, { ok: true, found: false });

  const joinedAt = member.joinedAt;
  // Joining position, which is the fun part of the answer: how many members
  // were already here when they arrived.
  const [earlier, total] = await Promise.all([
    prisma.legacyMember.count({ where: { joinedAt: { lt: joinedAt } } }),
    prisma.legacyMember.count(),
  ]);

  // Deliberately no tier, pricing or claim state: this endpoint answers a
  // community question and must not leak commercial information into chat.
  return jsonResponse(200, {
    ok: true,
    found: true,
    joinedAt: joinedAt.toISOString(),
    year: joinedAt.getUTCFullYear(),
    month: joinedAt.toLocaleString("en-US", { month: "long", timeZone: "UTC" }),
    rank: earlier + 1,
    total,
    // Dates derived from a first message/reaction rather than a real join
    // event are a LOWER BOUND (a lurker may have joined earlier), so the bot
    // words those more softly. The importer records which evidence it used.
    approximate: !(member.notes || "").includes("join_event"),
  });
}
