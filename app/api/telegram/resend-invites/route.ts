import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import {
  getTelegramConfig,
  membershipChatIds,
  createSingleUseInviteLink,
  sendTelegramMessage,
} from "@/lib/telegram/client";
import { checkVipTelegramAccess } from "@/lib/telegram/vip-access";

export const runtime = "nodejs";

const INVITE_LINK_TTL_SECONDS = 15 * 60;

/**
 * Re-sends VIP invite links to an already-linked member.
 *
 * Linking and joining are separate steps, and the join can fail on its own
 * (a Telegram error, an expired link, or simply leaving the group later).
 * Without this route a linked member has no way back in, because the access
 * key is single-use and the link page only offers one to unlinked accounts.
 *
 * No access key is involved: the Telegram account is already verified and
 * stored, so the links are delivered straight to it by the bot.
 */
export async function POST(): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return jsonResponse(401, { message: "Please sign in first." });

  const prisma = getPrismaClient();
  const config = getTelegramConfig();
  if (!prisma || !config) {
    return jsonResponse(503, { message: "Telegram is not configured yet." });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { telegramUserId: true },
  });
  if (!user?.telegramUserId) {
    return jsonResponse(400, { message: "Connect your Telegram account first." });
  }

  const access = await checkVipTelegramAccess(prisma, session.user.id);
  if (!access.ok) {
    if (access.reason === "no_membership") {
      return jsonResponse(403, { message: "An active KIRA VIP Membership is required." });
    }
    if (access.reason === "agreements_pending_counsel") {
      return jsonResponse(503, {
        message: "Membership documents are being finalised. Please try again shortly.",
      });
    }
    return jsonResponse(403, {
      message: "Please review and accept the membership documents first.",
      requiresAcceptance: access.missing,
    });
  }

  const chatIds = membershipChatIds(config);
  const links: string[] = [];
  for (const chatId of chatIds) {
    try {
      links.push(await createSingleUseInviteLink(config.botToken, chatId, INVITE_LINK_TTL_SECONDS));
    } catch (error) {
      console.error(`telegram/resend-invites: invite failed for chat ${chatId}`, error);
    }
  }

  if (links.length === 0) {
    return jsonResponse(502, {
      message: "We could not create your invite links just now. Please contact support.",
    });
  }

  try {
    await sendTelegramMessage(
      config.botToken,
      user.telegramUserId,
      [
        "Your KIRA VIP access links:",
        "",
        ...links,
        "",
        `Each link is single use and expires in ${INVITE_LINK_TTL_SECONDS / 60} minutes. Please don't share them.`,
      ].join("\n")
    );
  } catch (error) {
    console.error("telegram/resend-invites: could not DM the member", error);
    return jsonResponse(502, {
      message:
        "We created your links but couldn't message you on Telegram. Open a chat with the bot and try again.",
    });
  }

  return jsonResponse(200, {
    sent: links.length,
    partial: links.length < chatIds.length,
    expiresInMinutes: INVITE_LINK_TTL_SECONDS / 60,
  });
}
