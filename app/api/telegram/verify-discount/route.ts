import crypto from "node:crypto";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { hashToken, isExpired } from "@/lib/auth/tokens";
import { bestTier, describeTier } from "@/lib/config/legacy-tiers";
import type { MembershipTier } from "@/lib/config/pricing";

export const runtime = "nodejs";

/**
 * Bot-facing loyalty claim.
 *
 * The community bot polls (it cannot share a webhook), so it receives
 * `/start d_<token>` itself, confirms the person is currently in the free
 * group, then calls this endpoint. This route is the authority: it validates
 * the token, matches the Telegram account against the loyalty registry, and
 * sets the permanent pricing tier.
 *
 * Tier is only ever UPGRADED — an automated claim can never take away a
 * discount granted by manual review.
 */

function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function asTier(value: string | null | undefined): MembershipTier | null {
  return value === "founding" || value === "early_bird" ? value : null;
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
    claimToken?: unknown;
    telegramUserId?: unknown;
    telegramUsername?: unknown;
    isGroupMember?: unknown;
  } | null;

  const claimToken = typeof body?.claimToken === "string" ? body.claimToken.trim() : "";
  const telegramUserId =
    typeof body?.telegramUserId === "string" || typeof body?.telegramUserId === "number"
      ? String(body.telegramUserId)
      : "";
  const telegramUsername =
    typeof body?.telegramUsername === "string" ? body.telegramUsername.slice(0, 64) : null;

  if (!claimToken || !telegramUserId) {
    return jsonResponse(400, { ok: false, reason: "missing_fields" });
  }

  // The bot checks live group membership before calling; refuse if it says no.
  if (body?.isGroupMember === false) {
    return jsonResponse(200, { ok: false, reason: "not_in_group" });
  }

  const user = await prisma.user.findUnique({
    where: { discountClaimTokenHash: hashToken(claimToken) },
  });
  if (!user || !user.discountClaimTokenExpiresAt || isExpired(user.discountClaimTokenExpiresAt)) {
    return jsonResponse(200, { ok: false, reason: "invalid_or_expired" });
  }

  const legacy = await prisma.legacyMember.findUnique({ where: { telegramUserId } });

  if (!legacy || !legacy.tier) {
    // Genuine member but no dated record — send them to evidence review.
    return jsonResponse(200, { ok: false, reason: "no_legacy_record" });
  }

  // A Telegram account may only ever back one website account's discount.
  if (legacy.claimedByUserId && legacy.claimedByUserId !== user.id) {
    return jsonResponse(200, { ok: false, reason: "already_claimed_by_other" });
  }

  const resolved = bestTier(asTier(user.membershipTier), asTier(legacy.tier));

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        membershipTier: resolved,
        discountClaimedAt: new Date(),
        // Burn the token — single use.
        discountClaimTokenHash: null,
        discountClaimTokenExpiresAt: null,
        // Record the Telegram identity if we didn't already have it.
        telegramUserId: user.telegramUserId ?? telegramUserId,
        telegramUsername: user.telegramUsername ?? telegramUsername,
      },
    }),
    prisma.legacyMember.update({
      where: { telegramUserId },
      data: {
        claimedByUserId: user.id,
        claimedAt: new Date(),
        telegramUsername: telegramUsername ?? legacy.telegramUsername,
      },
    }),
  ]);

  return jsonResponse(200, {
    ok: true,
    tier: resolved,
    description: describeTier(resolved),
    joinedAt: legacy.joinedAt.toISOString().slice(0, 10),
  });
}
