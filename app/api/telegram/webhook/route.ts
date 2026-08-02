import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { getTelegramConfig, sendTelegramMessage, createSingleUseInviteLink } from "@/lib/telegram/client";
import { hashToken, isExpired } from "@/lib/auth/tokens";
import { ingestChannelPost } from "@/lib/trades/store";

export const runtime = "nodejs";

// The invite link itself is single-use and short-lived on top of that -
// belt and suspenders against a leaked link being reused by someone else.
const INVITE_LINK_TTL_SECONDS = 15 * 60;

interface TelegramChannelPost {
  message_id: number;
  text?: string;
  chat?: { id: number };
  reply_to_message?: { message_id: number };
}

interface TelegramUpdate {
  message?: {
    text?: string;
    from?: { id: number; username?: string };
  };
  channel_post?: TelegramChannelPost;
  edited_channel_post?: TelegramChannelPost;
}

/** The chat trades are read from — the VIP channel by default. */
function tradesChatId(channelChatId: string | null): string | null {
  return (process.env.TRADES_CHANNEL_CHAT_ID || "").trim() || channelChatId;
}

export async function POST(request: Request): Promise<Response> {
  const config = getTelegramConfig();
  const prisma = getPrismaClient();
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!config || !prisma || !webhookSecret) {
    return jsonResponse(503, { message: "Telegram webhook is not configured." });
  }

  const providedSecret = request.headers.get("x-telegram-bot-api-secret-token");
  if (providedSecret !== webhookSecret) {
    return jsonResponse(401, { message: "Invalid webhook secret." });
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;

  // --- VIP Live Dashboard: ingest trade signals + reply updates from the VIP
  // channel. Only posts from the configured trades chat are considered; a
  // parse/ingest failure is swallowed so it can never break the webhook. ---
  const post = update?.channel_post ?? update?.edited_channel_post;
  if (post?.chat?.id != null && typeof post.text === "string") {
    const tradesChat = tradesChatId(config.channelChatId);
    if (tradesChat && String(post.chat.id) === tradesChat) {
      try {
        await ingestChannelPost(prisma, {
          channelChatId: String(post.chat.id),
          messageId: post.message_id,
          text: post.text,
          replyToMessageId: post.reply_to_message?.message_id ?? null,
          isEdit: Boolean(update?.edited_channel_post),
        });
      } catch (err) {
        console.error("trade ingest failed:", err);
      }
    }
    return jsonResponse(200, { ok: true });
  }

  const message = update?.message;
  const text = message?.text;
  const fromId = message?.from?.id;

  if (message && typeof text === "string" && text.startsWith("/start") && fromId) {
    const rawToken = text.slice("/start".length).trim();

    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      const user = await prisma.user.findUnique({ where: { telegramInviteTokenHash: tokenHash } });

      if (user?.telegramInviteTokenExpiresAt && !isExpired(user.telegramInviteTokenExpiresAt)) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            telegramUserId: String(fromId),
            telegramUsername: message.from?.username || null,
            telegramLinkedAt: new Date(),
            telegramRemovedAt: null,
            telegramInviteTokenHash: null,
            telegramInviteTokenExpiresAt: null,
          },
        });

        try {
          const inviteLink = await createSingleUseInviteLink(
            config.botToken,
            config.groupChatId,
            INVITE_LINK_TTL_SECONDS
          );
          await sendTelegramMessage(
            config.botToken,
            fromId,
            `You're verified. Join the KIRA VIP group here (single use, expires in 15 minutes): ${inviteLink}`
          );
        } catch {
          await sendTelegramMessage(
            config.botToken,
            fromId,
            "Your account is linked, but the group invite could not be created. Contact support and we'll add you manually."
          );
        }
      } else {
        await sendTelegramMessage(
          config.botToken,
          fromId,
          "This link has expired or isn't recognized. Generate a new one from your Kira Engineer Hub account under Account > Telegram."
        );
      }
    }
  }

  return jsonResponse(200, { ok: true });
}
