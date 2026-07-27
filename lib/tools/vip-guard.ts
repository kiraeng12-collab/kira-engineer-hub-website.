/**
 * Server-side VIP gate for the calculator's VIP-only API routes (saved
 * profiles, history). Accepts either a website session or a verified Telegram
 * Mini App identity via the shared `resolveCaller`, then confirms the
 * `vip_telegram` entitlement. VIP status is NEVER taken from the request.
 */

import { jsonResponse } from "@/lib/api-utils";
import { resolveCaller } from "@/lib/tools/resolve-caller";
import type { PrismaClient } from "@/lib/generated/prisma";

export type VipContext = { userId: string; prisma: PrismaClient };

/** Returns the VIP context, or a ready-to-return error Response. */
export async function requireVip(request?: Request): Promise<VipContext | Response> {
  const caller = await resolveCaller(request);

  if (!caller.prisma) return jsonResponse(503, { message: "This feature is not configured yet." });
  if (!caller.userId) return jsonResponse(401, { message: "Please sign in first." });
  if (caller.access !== "vip") return jsonResponse(403, { message: "This feature is available to KIRA VIP members." });

  return { userId: caller.userId, prisma: caller.prisma };
}
