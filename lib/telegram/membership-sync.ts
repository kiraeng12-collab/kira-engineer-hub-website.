import { getTelegramConfig, removeChatMember } from "./client";
import type { PrismaClient } from "@/lib/generated/prisma";

// past_due is deliberately excluded - Stripe's Smart Retries give a grace
// window before a failed payment becomes a real lapse, and kicking someone
// over a single declined card would be poor UX for a temporary blip.
const ACCESS_REVOKING_STATUSES = new Set(["cancelled", "expired", "suspended", "refunded", "disputed"]);

/** Pure predicate: does this membership status mean VIP Telegram access should be revoked? */
export function shouldRevokeTelegramAccess(status: string): boolean {
  return ACCESS_REVOKING_STATUSES.has(status);
}

/**
 * Removes a linked member from the private group once their membership
 * status no longer qualifies for VIP access. No-op if Telegram isn't
 * configured, the user was never linked, or they were already removed.
 */
export async function syncTelegramAccessForUser(
  prisma: PrismaClient,
  userId: string,
  status: string
): Promise<void> {
  if (!shouldRevokeTelegramAccess(status)) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.telegramUserId || user.telegramRemovedAt) return;

  const config = getTelegramConfig();
  if (!config) return;

  await removeChatMember(config.botToken, config.groupChatId, user.telegramUserId);
  await prisma.user.update({ where: { id: userId }, data: { telegramRemovedAt: new Date() } });
}
