import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { getTelegramConfig } from "@/lib/telegram/client";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import { checkVipTelegramAccess } from "@/lib/telegram/vip-access";

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

  const access = await checkVipTelegramAccess(prisma, session.user.id);
  if (!access.ok) {
    if (access.reason === "no_membership") {
      return jsonResponse(403, {
        message: "An active KIRA VIP Membership is required before linking Telegram.",
      });
    }
    if (access.reason === "agreements_pending_counsel") {
      return jsonResponse(503, {
        message: "Membership documents are being finalised. Please try again shortly.",
      });
    }
    return jsonResponse(403, {
      message: "Please review and accept the membership documents before joining.",
      requiresAcceptance: access.missing,
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
