import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { getTelegramConfig } from "@/lib/telegram/client";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import { getActiveProducts } from "@/lib/entitlements/service";
import { checkConsentForProducts } from "@/lib/agreements/service";

export const runtime = "nodejs";

const INVITE_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function POST(): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return jsonResponse(401, { message: "Please sign in first." });

  const prisma = getPrismaClient();
  const config = getTelegramConfig();
  if (!prisma || !config) {
    return jsonResponse(503, { message: "Telegram linking is not configured yet." });
  }

  // Access check. Entitlements are the new source of truth; the legacy
  // Membership row is still honoured so members who paid before the
  // entitlement backfill are not locked out. Drop the fallback once every
  // active membership has a matching entitlement row.
  const activeProducts = await getActiveProducts(prisma, session.user.id);
  let hasVip = activeProducts.includes("vip_membership");
  if (!hasVip) {
    const membership = await prisma.membership.findUnique({ where: { userId: session.user.id } });
    hasVip = membership?.status === "active";
  }
  if (!hasVip) {
    return jsonResponse(403, {
      message: "An active KIRA VIP Membership is required before linking Telegram.",
    });
  }

  // Consent gate: the access key is only issued once the member has accepted
  // every agreement the VIP membership requires, at its current version. This
  // is what makes "you cannot join without agreeing" a technical guarantee
  // rather than a policy. Scoped to vip_membership deliberately — a pending
  // agreement on an unrelated product must not block VIP access.
  const consent = await checkConsentForProducts(prisma, session.user.id, ["vip_membership"]);
  if (!consent.ok) {
    if (consent.reason === "agreements_pending_counsel") {
      return jsonResponse(503, {
        message: "Membership documents are being finalised. Please try again shortly.",
      });
    }
    return jsonResponse(403, {
      message: "Please review and accept the membership documents before joining.",
      requiresAcceptance: consent.missing.map((a) => ({
        key: a.key,
        title: a.title,
        version: a.version,
        href: a.href,
      })),
    });
  }

  const rawToken = generateRawToken();
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      telegramInviteTokenHash: hashToken(rawToken),
      telegramInviteTokenExpiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
    },
  });

  return jsonResponse(200, {
    deepLink: `https://t.me/${config.botUsername}?start=${rawToken}`,
    expiresInMinutes: INVITE_TOKEN_TTL_MS / 60000,
  });
}
