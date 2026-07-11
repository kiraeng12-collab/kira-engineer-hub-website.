interface TelegramConfig {
  botToken: string;
  botUsername: string;
  groupChatId: string;
}

/**
 * Lazily-read Telegram config. Returns null when any required env var is
 * unset, so callers can degrade gracefully (mirrors how Stripe/Prisma/Resend
 * env vars are handled elsewhere in this repo).
 */
export function getTelegramConfig(): TelegramConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;
  if (!botToken || !botUsername || !groupChatId) return null;
  return { botToken, botUsername, groupChatId };
}

async function callTelegramApi<T>(
  botToken: string,
  method: string,
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Telegram API error (${method}): ${data.description || response.status}`);
  }
  return data.result as T;
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: number | string,
  text: string
): Promise<void> {
  await callTelegramApi(botToken, "sendMessage", { chat_id: chatId, text });
}

/** Single-use invite link, expiring in `expireSeconds` - one join redeems it. */
export async function createSingleUseInviteLink(
  botToken: string,
  groupChatId: string,
  expireSeconds: number
): Promise<string> {
  const result = await callTelegramApi<{ invite_link: string }>(botToken, "createChatInviteLink", {
    chat_id: groupChatId,
    member_limit: 1,
    expire_date: Math.floor(Date.now() / 1000) + expireSeconds,
  });
  return result.invite_link;
}

/**
 * Removes a member from the group as a kick, not a permanent ban: unban
 * immediately after so they can rejoin with a fresh invite link if they
 * resubscribe later.
 */
export async function removeChatMember(
  botToken: string,
  groupChatId: string,
  telegramUserId: string
): Promise<void> {
  await callTelegramApi(botToken, "banChatMember", { chat_id: groupChatId, user_id: telegramUserId });
  await callTelegramApi(botToken, "unbanChatMember", {
    chat_id: groupChatId,
    user_id: telegramUserId,
    only_if_banned: true,
  });
}
