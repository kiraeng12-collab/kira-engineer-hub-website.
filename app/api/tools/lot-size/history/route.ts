/**
 * VIP calculation history — the caller's own recent calculations, newest first.
 */

import { jsonResponse } from "@/lib/api-utils";
import { requireVip } from "@/lib/tools/vip-guard";
import { listHistory } from "@/lib/tools/lot-size-store";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const ctx = await requireVip(request);
  if (ctx instanceof Response) return ctx;
  const history = await listHistory(ctx.prisma, ctx.userId, 25);
  return jsonResponse(200, { history });
}
