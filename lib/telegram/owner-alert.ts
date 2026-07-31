import { getTelegramConfig, sendTelegramMessage } from "./client";
import type { PrismaClient } from "@/lib/generated/prisma";

/**
 * DMs the configured owner the moment a member's VIP access is revoked, so
 * lapses are visible in real time (the owner can nudge a renewal). No-op when
 * Telegram or TELEGRAM_OWNER_CHAT_ID is unset, and never throws into the caller
 * — an alert failure must not block the expiry/removal itself.
 */
export async function notifyOwnerAccessRevoked(
  prisma: PrismaClient,
  userId: string,
  product: string,
  reason: string
): Promise<void> {
  try {
    const ownerChatId = (process.env.TELEGRAM_OWNER_CHAT_ID || "").trim();
    if (!ownerChatId) return;

    const config = getTelegramConfig();
    if (!config) return;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, membershipTier: true },
    });
    if (!user) return;

    const who = user.name ? `${user.name} (${user.email})` : user.email;
    const text = [
      "⚠️ VIP access expired",
      "",
      `Member: ${who}`,
      `Product: ${product}`,
      user.membershipTier ? `Tier: ${user.membershipTier}` : null,
      `Reason: ${reason}`,
      "",
      "Access removed from the VIP chats (if they were linked).",
    ]
      .filter(Boolean)
      .join("\n");

    await sendTelegramMessage(config.botToken, ownerChatId, text);
  } catch (error) {
    console.error("owner expiry alert failed", userId, error instanceof Error ? error.message : error);
  }
}
