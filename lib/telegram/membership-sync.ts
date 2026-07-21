import { getTelegramConfig, membershipChatIds, removeChatMember } from "./client";
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
 * Removes a linked member from every VIP chat (group and channel) once their
 * membership status no longer qualifies for access. No-op if Telegram isn't
 * configured, the user was never linked, or they were already removed.
 *
 * Removal is attempted for every chat even if one fails, so a single API error
 * cannot leave the member with access to the other chat. The member is only
 * marked removed once all chats succeeded; otherwise the error propagates and
 * the removal is retried later (banChatMember is idempotent).
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

  const failures: string[] = [];
  for (const chatId of membershipChatIds(config)) {
    try {
      await removeChatMember(config.botToken, chatId, user.telegramUserId);
    } catch (error) {
      failures.push(`${chatId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Telegram removal failed for user ${userId} - ${failures.join("; ")}`);
  }

  await prisma.user.update({ where: { id: userId }, data: { telegramRemovedAt: new Date() } });
}
