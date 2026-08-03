/**
 * Single source of truth for "who is calling the calculator, and at what tier?"
 *
 * Two authentication paths, shared by every calculator route so they can never
 * drift apart:
 *   1. A website next-auth session, or
 *   2. A verified Telegram Mini App `initData` header (X-Telegram-Init-Data).
 *
 * VIP status is granted to anyone who is a live member of the VIP group or
 * channel, OR who holds the `vip_telegram` entitlement (a paying website user
 * who may not have linked Telegram yet). It is never taken from the request —
 * the Telegram id is trusted only after HMAC verification.
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { hasEntitlement } from "@/lib/entitlements/service";
import { getTelegramConfig, isVipGroupMember } from "@/lib/telegram/client";
import { verifyTelegramInitData } from "@/lib/telegram/init-data";
import type { PrismaClient } from "@/lib/generated/prisma";

export type Caller = {
  access: "free" | "vip";
  userId: string | null;
  /** How the caller authenticated, for logging/telemetry. */
  via: "session" | "telegram" | "anonymous";
  prisma: PrismaClient | null;
};

export async function resolveCaller(request?: Request): Promise<Caller> {
  const prisma = getPrismaClient();

  // Path 1 — website session.
  const session = await getServerSession(authOptions);
  const sessionUserId = session?.user?.id ?? null;
  if (sessionUserId) {
    let vip = prisma ? await hasEntitlement(prisma, sessionUserId, "vip_telegram") : false;
    // Also honour live VIP group/channel membership via their linked Telegram.
    if (!vip && prisma) {
      const config = getTelegramConfig();
      const u = await prisma.user.findUnique({ where: { id: sessionUserId }, select: { telegramUserId: true } });
      if (config && u?.telegramUserId) vip = await isVipGroupMember(config, u.telegramUserId).catch(() => false);
    }
    return { access: vip ? "vip" : "free", userId: sessionUserId, via: "session", prisma };
  }

  // Path 2 — Telegram Mini App initData.
  const initData = request?.headers.get("x-telegram-init-data");
  if (initData) {
    const config = getTelegramConfig();
    if (config) {
      const verified = verifyTelegramInitData(initData, config.botToken);
      if (verified.ok && prisma) {
        // VIP = a live member of the VIP group/channel, OR a linked account that
        // holds the vip_telegram key. Group/channel membership alone is enough,
        // so legacy joins without a website account still get in.
        const linked = await prisma.user.findUnique({
          where: { telegramUserId: verified.user.id },
          select: { id: true },
        });
        let vip = await isVipGroupMember(config, verified.user.id).catch(() => false);
        if (!vip && linked) vip = await hasEntitlement(prisma, linked.id, "vip_telegram");
        return { access: vip ? "vip" : "free", userId: linked?.id ?? null, via: "telegram", prisma };
      }
    }
  }

  return { access: "free", userId: null, via: "anonymous", prisma };
}
