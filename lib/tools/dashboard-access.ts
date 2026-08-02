/**
 * Access gate for the VIP Live Dashboard. Stricter than the calculator: a
 * member must hold a valid VIP KEY (the vip_telegram entitlement) AND currently
 * be a member of the VIP group/channel. Both are required.
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
  | { ok: true; prisma: PrismaClient; userId: string }
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

  if (!userId) return { ok: false, status: 401, message: "Open the dashboard from the KIRA VIP bot while signed in." };

  // 1) Valid VIP key.
  const hasKey = await hasEntitlement(prisma, userId, "vip_telegram");
  if (!hasKey) return { ok: false, status: 403, message: "This dashboard is for active KIRA VIP members." };

  // 2) Currently in the VIP group/channel.
  if (!telegramId || !config) {
    return { ok: false, status: 403, message: "Link your Telegram to your VIP account to access the dashboard." };
  }
  const inGroup = await isVipGroupMember(config, telegramId).catch(() => false);
  if (!inGroup) return { ok: false, status: 403, message: "You must be a member of the KIRA VIP group to view the dashboard." };

  return { ok: true, prisma, userId };
}
