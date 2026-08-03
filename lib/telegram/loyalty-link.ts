import crypto from "node:crypto";
import type { PrismaClient } from "@/lib/generated/prisma";
import { bestTier } from "@/lib/config/legacy-tiers";
import type { MembershipTier } from "@/lib/config/pricing";

/**
 * Signed loyalty deep link (the /vip DM flow).
 *
 * The bot already knows the member's Telegram id and has confirmed their
 * community join date, so it can hand them a checkout link that carries a
 * signed reference to their Telegram account. When they land on the site and
 * authenticate, we read the authoritative tier from the loyalty registry and
 * apply it — so the discount is live before they pay, without a second claim
 * round-trip.
 *
 * Security: the link only *identifies* the Telegram account (HMAC-signed with
 * the shared bot secret, short-lived). The tier itself is always read from the
 * registry server-side, only ever UPGRADED (never downgrades a manually-granted
 * tier), and a Telegram account can still only back one website account — the
 * same guarantees as the token-based claim in verify-discount.
 */

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // link stays valid through a signup detour

// Set when a visitor hits the signed /vip link before signing in, so their
// loyalty claim survives the create-account / sign-in detour.
export const VIP_CLAIM_COOKIE = "kira_vip_claim";

function secret(): string | null {
  // Same shared value the bot signs with (KIRA_VERIFY_SECRET on the bot side).
  return process.env.TELEGRAM_BOT_VERIFY_SECRET || null;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string, key: string): string {
  return crypto.createHmac("sha256", key).update(payload).digest("base64url");
}

/** Build the signed token (mirrors the bot; handy for tests/tools). */
export function makeClaimToken(telegramUserId: string, now: number = Date.now()): string | null {
  const key = secret();
  if (!key) return null;
  const payload = b64url(JSON.stringify({ t: String(telegramUserId), exp: now + MAX_AGE_MS }));
  return `${payload}.${sign(payload, key)}`;
}

/** Verify a signed token and return the Telegram id, or null if bad/expired. */
export function verifyClaimToken(token: string | null | undefined): { telegramUserId: string } | null {
  const key = secret();
  if (!key || !token || typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const providedSig = token.slice(dot + 1);
  const expectedSig = sign(payload, key);
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      t?: unknown;
      exp?: unknown;
    };
    const telegramUserId = typeof data.t === "string" || typeof data.t === "number" ? String(data.t) : "";
    const exp = typeof data.exp === "number" ? data.exp : 0;
    if (!telegramUserId || exp <= Date.now()) return null;
    return { telegramUserId };
  } catch {
    return null;
  }
}

function asTier(value: string | null | undefined): MembershipTier | null {
  return value === "founding" || value === "early_bird" ? value : null;
}

/**
 * Apply the loyalty tier tied to a Telegram account to a logged-in website user.
 * Idempotent and upgrade-only; returns the resolved tier, or null if there was
 * nothing to apply (no dated registry record, or already claimed by someone
 * else). Mirrors verify-discount, minus the one-time claim token.
 */
export async function applyLoyaltyClaim(
  prisma: PrismaClient,
  userId: string,
  telegramUserId: string,
  telegramUsername: string | null = null
): Promise<MembershipTier | null> {
  const legacy = await prisma.legacyMember.findUnique({ where: { telegramUserId } });
  if (!legacy || !legacy.tier) return null;

  // A Telegram account may only ever back one website account's discount.
  if (legacy.claimedByUserId && legacy.claimedByUserId !== userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { membershipTier: true, telegramUserId: true, telegramUsername: true },
  });
  if (!user) return null;

  const resolved = bestTier(asTier(user.membershipTier), asTier(legacy.tier));

  // Nothing changed and identity already recorded — skip the write.
  if (resolved === user.membershipTier && legacy.claimedByUserId === userId) {
    return asTier(resolved);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        membershipTier: resolved,
        discountClaimedAt: new Date(),
        telegramUserId: user.telegramUserId ?? telegramUserId,
        telegramUsername: user.telegramUsername ?? telegramUsername,
      },
    }),
    prisma.legacyMember.update({
      where: { telegramUserId },
      data: {
        claimedByUserId: userId,
        claimedAt: new Date(),
        telegramUsername: telegramUsername ?? legacy.telegramUsername,
      },
    }),
  ]);

  return asTier(resolved);
}
