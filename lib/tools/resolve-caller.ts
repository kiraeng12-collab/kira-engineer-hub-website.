/**
 * Single source of truth for "who is calling the calculator, and at what tier?"
 *
 * Two authentication paths, shared by every calculator route so they can never
 * drift apart:
 *   1. A website next-auth session, or
 *   2. A verified Telegram Mini App `initData` header (X-Telegram-Init-Data).
 *
 * STRICT RULE: VIP status is granted ONLY to a live member of the VIP group or
 * channel. There is no entitlement bypass — a paying website user who is not in
 * the group/channel does not get VIP calculator access. VIP is never taken from
 * the request; the Telegram id is trusted only after HMAC verification and
 * membership is confirmed live via getChatMember (fail-closed on any error).
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
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
  const config = getTelegramConfig();

  // Resolve a VERIFIED Telegram id (and any linked account) from either path.
  let telegramId: string | null = null;
  let userId: string | null = null;
  let via: Caller["via"] = "anonymous";

  // Path 1 — website session: use the Telegram id linked to the account.
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    via = "session";
    userId = session.user.id;
    if (prisma) {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { telegramUserId: true } });
      telegramId = u?.telegramUserId ?? null;
    }
  } else {
    // Path 2 — Telegram Mini App: HMAC-verified initData gives the Telegram id.
    const initData = request?.headers.get("x-telegram-init-data");
    if (initData && config) {
      const verified = verifyTelegramInitData(initData, config.botToken);
      if (verified.ok) {
        via = "telegram";
        telegramId = verified.user.id;
        if (prisma) {
          const linked = await prisma.user.findUnique({
            where: { telegramUserId: telegramId },
            select: { id: true },
          });
          userId = linked?.id ?? null;
        }
      }
    }
  }

  // VIP requires live VIP group/channel membership — nothing else grants it.
  const vip = telegramId && config ? await isVipGroupMember(config, telegramId).catch(() => false) : false;
  return { access: vip ? "vip" : "free", userId, via, prisma };
}
