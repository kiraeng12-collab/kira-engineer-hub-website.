/**
 * Access gate for the VIP Live Dashboard.
 *
 * STRICT RULE: the viewer must be a live member of the VIP group or channel.
 * This is the only way in — there is no entitlement bypass, so anyone who is
 * not currently in the VIP group/channel (never joined, left, or was removed)
 * cannot open the dashboard, full stop.
 *
 * The Telegram identity is trusted only after HMAC verification (verified Mini
 * App initData, or the Telegram id on the signed-in website account), and
 * membership is confirmed live against Telegram via getChatMember. Every
 * failure path denies (fail-closed): no identity, an unverifiable identity, a
 * Telegram API error, or the bot lacking admin all result in "no access".
 *
 * Works from either a website session or a verified Telegram Mini App identity.
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { getTelegramConfig, isVipGroupMember } from "@/lib/telegram/client";
import { verifyTelegramInitData } from "@/lib/telegram/init-data";
import type { PrismaClient } from "@/lib/generated/prisma";

export type DashboardAccess =
  | { ok: true; prisma: PrismaClient; userId: string | null }
  | { ok: false; status: number; message: string };

export async function resolveDashboardAccess(request: Request): Promise<DashboardAccess> {
  const prisma = getPrismaClient();
  if (!prisma) return { ok: false, status: 503, message: "The dashboard is not configured yet." };
  const config = getTelegramConfig();

  let telegramId: string | null = null;
  let userId: string | null = null;

  // Website session → derive the Telegram id from the linked account.
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    userId = session.user.id;
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { telegramUserId: true } });
    telegramId = u?.telegramUserId ?? null;
  } else {
    // Telegram Mini App → verified initData gives the Telegram id.
    const initData = request.headers.get("x-telegram-init-data");
    if (initData && config) {
      const verified = verifyTelegramInitData(initData, config.botToken);
      if (verified.ok) {
        telegramId = verified.user.id;
        const linked = await prisma.user.findUnique({
          where: { telegramUserId: telegramId },
          select: { id: true },
        });
        userId = linked?.id ?? null;
      }
    }
  }

  // A verified Telegram identity is mandatory — without one we cannot check
  // VIP-group membership, so there is nothing to grant access on.
  if (!telegramId || !config) {
    return {
      ok: false,
      status: 401,
      message: "Open the dashboard from the KIRA VIP bot so we can verify your VIP membership.",
    };
  }

  // The ONLY gate: live membership of the VIP group/channel. No entitlement
  // bypass — not in the group means no dashboard. Fail-closed on any error.
  const inGroup = await isVipGroupMember(config, telegramId).catch(() => false);
  if (!inGroup) {
    return {
      ok: false,
      status: 403,
      message: "This dashboard is for KIRA VIP members — you must be in the VIP group to open it.",
    };
  }

  return { ok: true, prisma, userId };
}
