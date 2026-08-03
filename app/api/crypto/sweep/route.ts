import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { setEntitlementStatus } from "@/lib/entitlements/service";
import { syncTelegramAccessForUser } from "@/lib/telegram/membership-sync";
import { notifyOwnerAccessRevoked } from "@/lib/telegram/owner-alert";
import { isProductId } from "@/lib/config/products";

export const runtime = "nodejs";

/**
 * Scheduled sweep that expires lapsed fixed-window memberships.
 *
 * Card subscriptions signal their own end via Stripe webhooks; crypto payments
 * and admin grants (grandfathered / pre-launch members) have no such signal, so
 * this job finds those fixed-window entitlements whose period has passed, marks
 * them expired, and removes the member from the VIP Telegram chats. Runs from a
 * Vercel Cron (see vercel.json) and is protected by CRON_SECRET.
 *
 * It only ever touches non-auto-renewing sources (crypto, admin_grant), so it
 * can never disturb an active card subscription.
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
    where: {
      source: { in: ["crypto", "admin_grant"] },
      status: "active",
      currentPeriodEnd: { lt: now },
    },
    select: { userId: true, product: true, source: true },
  });

  let expired = 0;
  for (const row of lapsed) {
    if (!isProductId(row.product)) continue;
    const reason = row.source === "admin_grant" ? "granted membership period ended" : "crypto membership period ended";
    await setEntitlementStatus(prisma, row.userId, row.product, "expired").catch((e) =>
      console.error("sweep: expire failed", row.userId, e)
    );
    await syncTelegramAccessForUser(prisma, row.userId, "expired").catch((e) =>
      console.error("sweep: telegram removal failed", row.userId, e)
    );
    await notifyOwnerAccessRevoked(prisma, row.userId, row.product, reason);
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
