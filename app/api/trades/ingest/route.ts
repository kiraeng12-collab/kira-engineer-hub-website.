/**
 * Trade ingestion endpoint for the VIP Live Dashboard.
 *
 * Your bot runs via long-polling (a separate process), so it — not this site —
 * receives channel posts. This endpoint lets that bot forward a VIP-channel
 * post here to be parsed into the trade board. Secured by a shared secret
 * (TRADES_INGEST_SECRET) that only your bot and this site know.
 *
 * The bot should call this on every channel post from the VIP channel:
 *   POST /api/trades/ingest
 *   headers: { "x-ingest-secret": <TRADES_INGEST_SECRET>, "content-type": "application/json" }
 *   body: { chatId, messageId, text, replyToMessageId?, isEdit? }
 *
 * Signals become trades; replies to a signal update it (TP1/TP2/SL/BE/close).
 */

import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { ingestChannelPost } from "@/lib/trades/store";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.TRADES_INGEST_SECRET;
  if (!secret) return jsonResponse(503, { message: "Trade ingestion is not configured." });
  if (request.headers.get("x-ingest-secret") !== secret) {
    return jsonResponse(401, { message: "Invalid ingest secret." });
  }

  const prisma = getPrismaClient();
  if (!prisma) return jsonResponse(503, { message: "Database is not configured." });

  let body: {
    chatId?: string | number;
    messageId?: number;
    text?: string;
    replyToMessageId?: number | null;
    isEdit?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { message: "Invalid JSON body." });
  }

  if (body.chatId == null || body.messageId == null || typeof body.text !== "string") {
    return jsonResponse(400, { message: "chatId, messageId and text are required." });
  }

  const result = await ingestChannelPost(prisma, {
    channelChatId: String(body.chatId),
    messageId: Number(body.messageId),
    text: body.text,
    replyToMessageId: body.replyToMessageId ?? null,
    isEdit: Boolean(body.isEdit),
  });

  return jsonResponse(200, result);
}
