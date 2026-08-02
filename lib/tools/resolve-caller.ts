/**
 * Single source of truth for "who is calling the calculator, and at what tier?"
 *
 * Two authentication paths, shared by every calculator route so they can never
 * drift apart:
 *   1. A website next-auth session, or
 *   2. A verified Telegram Mini App `initData` header (X-Telegram-Init-Data).
 *
 * VIP status always comes from the `vip_telegram` entitlement — never from the
 * request. The Telegram id is trusted only after HMAC verification and only
 * once it maps to a linked website account.
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { hasEntitlement } from "@/lib/entitlements/service";
import { getTelegramConfig } from "@/lib/telegram/client";
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
    const vip = prisma ? await hasEntitlement(prisma, sessionUserId, "vip_telegram") : false;
    return { access: vip ? "vip" : "free", userId: sessionUserId, via: "session", prisma };
  }

  // Path 2 — Telegram Mini App initData.
  const initData = request?.headers.get("x-telegram-init-data");
  if (initData) {
    const config = getTelegramConfig();
    if (config) {
      const verified = verifyTelegramInitData(initData, config.botToken);
      if (verified.ok && prisma) {
        // VIP requires a valid VIP KEY: the Telegram account must be linked to a
        // website account that holds the vip_telegram entitlement. Being in the
        // VIP group is NOT sufficient — team members, guests, and legacy joins
        // sit in the group without a paid key and must stay locked out.
        const linked = await prisma.user.findUnique({
          where: { telegramUserId: verified.user.id },
          select: { id: true },
        });
        const vip = linked ? await hasEntitlement(prisma, linked.id, "vip_telegram") : false;
        return { access: vip ? "vip" : "free", userId: linked?.id ?? null, via: "telegram", prisma };
      }
    }
  }

  return { access: "free", userId: null, via: "anonymous", prisma };
}
