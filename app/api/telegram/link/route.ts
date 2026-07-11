import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { getTelegramConfig } from "@/lib/telegram/client";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";

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

  const membership = await prisma.membership.findUnique({ where: { userId: session.user.id } });
  if (!membership || membership.status !== "active") {
    return jsonResponse(403, {
      message: "An active KIRA VIP Membership is required before linking Telegram.",
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
