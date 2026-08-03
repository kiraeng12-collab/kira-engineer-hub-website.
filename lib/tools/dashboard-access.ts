/**
 * Access gate for the VIP Live Dashboard. Open to anyone who is a live member
 * of the VIP group/channel, OR who holds a valid VIP KEY (the vip_telegram
 * entitlement) — a paying website user who may not have linked Telegram yet.
 * Group/channel membership alone is enough, so legacy joins without a website
 * account still get in.
 *
 * Works from either a website session or a verified Telegram Mini App identity.
 * The Telegram id needed for the group check comes from verified initData
 * (Mini App) or from the linked website account (session).
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { hasEntitlement } from "@/lib/entitlements/service";
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

  // Need at least one identity to check membership against.
  if (!userId && !telegramId) {
    return { ok: false, status: 401, message: "Open the dashboard from the KIRA VIP bot." };
  }

  // VIP = a live member of the VIP group/channel, OR a linked account holding
  // the vip_telegram key. Group/channel membership alone is enough.
  let vip = false;
  if (telegramId && config) vip = await isVipGroupMember(config, telegramId).catch(() => false);
  if (!vip && userId) vip = await hasEntitlement(prisma, userId, "vip_telegram");

  if (!vip) {
    return {
      ok: false,
      status: 403,
      message: "This dashboard is for KIRA VIP members — join the VIP group to access it.",
    };
  }

  return { ok: true, prisma, userId };
}
