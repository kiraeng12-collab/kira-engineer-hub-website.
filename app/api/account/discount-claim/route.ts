import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { getTelegramConfig } from "@/lib/telegram/client";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";

export const runtime = "nodejs";

const CLAIM_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Issues a one-time link that lets a member prove their Kira Trading Community
 * tenure and claim their permanent loyalty price.
 *
 * Unlike /api/telegram/link this deliberately does NOT require an active
 * membership — the whole point is to establish the discount *before* buying.
 * The bot redeems it against /api/telegram/verify-discount.
 */
export async function POST(): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return jsonResponse(401, { message: "Please sign in first." });

  const prisma = getPrismaClient();
  const config = getTelegramConfig();
  if (!prisma || !config) {
    return jsonResponse(503, { message: "Telegram verification is not configured yet." });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return jsonResponse(401, { message: "Please sign in first." });

  // Already on a loyalty tier — nothing to claim.
  if (user.membershipTier === "founding" || user.membershipTier === "early_bird") {
    return jsonResponse(200, {
      alreadyClaimed: true,
      tier: user.membershipTier,
      message: "Your community pricing is already active.",
    });
  }

  const rawToken = generateRawToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      discountClaimTokenHash: hashToken(rawToken),
      discountClaimTokenExpiresAt: new Date(Date.now() + CLAIM_TOKEN_TTL_MS),
    },
  });

  // The "d_" prefix keeps discount claims distinguishable from paid access
  // keys, which share the same character set.
  return jsonResponse(200, {
    deepLink: `https://t.me/${config.botUsername}?start=d_${rawToken}`,
    expiresInMinutes: CLAIM_TOKEN_TTL_MS / 60000,
  });
}
