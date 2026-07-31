import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { setEntitlementStatus } from "@/lib/entitlements/service";
import { syncTelegramAccessForUser } from "@/lib/telegram/membership-sync";
import { notifyOwnerAccessRevoked } from "@/lib/telegram/owner-alert";
import { isProductId } from "@/lib/config/products";

export const runtime = "nodejs";

/**
 * Scheduled sweep that expires lapsed crypto memberships.
 *
 * Card subscriptions signal their own end via Stripe webhooks; a crypto payment
 * has no such signal, so this job finds crypto-granted entitlements whose fixed
 * window has passed, marks them expired, and removes the member from the VIP
 * Telegram chats. Runs from a Vercel Cron (see vercel.json) and is protected by
 * CRON_SECRET so it can't be triggered by the public.
 *
 * It only ever touches source="crypto" entitlements, so it can never disturb an
 * active card subscription.
 */
async function runSweep(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return jsonResponse(503, { ok: false, reason: "not_configured" });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return jsonResponse(401, { ok: false, reason: "unauthorized" });
  }

  const prisma = getPrismaClient();
  if (!prisma) return jsonResponse(503, { ok: false, reason: "no_db" });

  const now = new Date();
  const lapsed = await prisma.entitlement.findMany({
    where: { source: "crypto", status: "active", currentPeriodEnd: { lt: now } },
    select: { userId: true, product: true },
  });

  let expired = 0;
  for (const row of lapsed) {
    if (!isProductId(row.product)) continue;
    await setEntitlementStatus(prisma, row.userId, row.product, "expired").catch((e) =>
      console.error("crypto sweep: expire failed", row.userId, e)
    );
    await syncTelegramAccessForUser(prisma, row.userId, "expired").catch((e) =>
      console.error("crypto sweep: telegram removal failed", row.userId, e)
    );
    await notifyOwnerAccessRevoked(prisma, row.userId, row.product, "crypto membership period ended");
    expired += 1;
  }

  return jsonResponse(200, { ok: true, checked: lapsed.length, expired });
}

// Vercel Cron issues a GET; POST is accepted too for manual runs with the secret.
export async function GET(request: Request): Promise<Response> {
  return runSweep(request);
}
export async function POST(request: Request): Promise<Response> {
  return runSweep(request);
}
