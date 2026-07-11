import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { getTelegramConfig, sendTelegramMessage, createSingleUseInviteLink } from "@/lib/telegram/client";
import { hashToken, isExpired } from "@/lib/auth/tokens";

export const runtime = "nodejs";

// The invite link itself is single-use and short-lived on top of that -
// belt and suspenders against a leaked link being reused by someone else.
const INVITE_LINK_TTL_SECONDS = 15 * 60;

interface TelegramUpdate {
  message?: {
    text?: string;
    from?: { id: number; username?: string };
  };
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
