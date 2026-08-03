import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import {
  getNowPaymentsConfig,
  verifyIpn,
  NOWPAYMENTS_PAID_STATUSES,
  NOWPAYMENTS_FAILED_STATUSES,
} from "@/lib/crypto/nowpayments";
import { grantEntitlement, setEntitlementStatus } from "@/lib/entitlements/service";
import { markConsentEffective } from "@/lib/agreements/service";
import { syncTelegramAccessForUser } from "@/lib/telegram/membership-sync";
import { deliverVipInviteDM } from "@/lib/telegram/provision-purchase";
import { cryptoPeriodEnd } from "@/lib/config/crypto";
import type { PlanId } from "@/lib/config/pricing";

export const runtime = "nodejs";

/**
 * NOWPayments IPN (webhook). Verifies the HMAC signature, then reconciles the
 * matching CryptoPayment row. Granting is idempotent: the pending -> paid flip
 * is a single conditional update, so a replayed or duplicated webhook can never
 * grant access twice. Crypto access is a fixed window (no auto-renew); the
 * scheduled sweep removes it when the window ends.
 */
export async function POST(request: Request): Promise<Response> {
  const prisma = getPrismaClient();
  const npConfig = getNowPaymentsConfig();
  if (!prisma || !npConfig) return jsonResponse(503, { ok: false, reason: "not_configured" });

  const rawBody = await request.text();
  const payload = verifyIpn(rawBody, request.headers.get("x-nowpayments-sig"), npConfig.ipnSecret);
  if (!payload) return jsonResponse(401, { ok: false, reason: "bad_signature" });

  const orderId = typeof payload.order_id === "string" ? payload.order_id : "";
  const paymentStatus = typeof payload.payment_status === "string" ? payload.payment_status : "";
  const providerPaymentId =
    payload.payment_id != null ? String(payload.payment_id) : null;
  if (!orderId) return jsonResponse(200, { ok: true, ignored: "no_order_id" });

  const record = await prisma.cryptoPayment.findUnique({ where: { orderId } });
  if (!record) return jsonResponse(200, { ok: true, ignored: "unknown_order" });

  // Keep the processor payment id for the audit trail regardless of outcome.
  if (providerPaymentId && record.providerPaymentId !== providerPaymentId) {
    await prisma.cryptoPayment.update({ where: { orderId }, data: { providerPaymentId } }).catch(() => {});
  }

  // --- Paid ---
  if (NOWPAYMENTS_PAID_STATUSES.has(paymentStatus)) {
    const periodEnd = cryptoPeriodEnd(record.plan as PlanId);

    // Atomic pending -> paid flip. Only the first webhook that flips it grants
    // access; later duplicates see count 0 and no-op.
    const flip = await prisma.cryptoPayment.updateMany({
      where: { orderId, status: { not: "paid" } },
      data: { status: "paid", paidAt: new Date(), periodEnd },
    });
    if (flip.count === 0) return jsonResponse(200, { ok: true, alreadyProcessed: true });

    await grantEntitlement(prisma, {
      userId: record.userId,
      product: "vip_membership",
      status: "active",
      source: "crypto",
      currentPeriodEnd: periodEnd,
      note: `crypto ${record.plan} (${record.accessDays}d) order ${orderId}`,
    }).catch((e) => console.error("crypto grant failed", e));

    // Stamp the signing as effective at payment settlement (idempotent).
    await markConsentEffective(prisma, record.consentRecordId, null, Math.floor(Date.now() / 1000)).catch(() => {});

    // Telegram-first crypto purchase: the account is already linked to their
    // Telegram id, so deliver the VIP invite straight to their DM. (Website
    // crypto payers aren't linked yet, so this is a no-op for them.)
    const paidUser = await prisma.user.findUnique({
      where: { id: record.userId },
      select: { telegramUserId: true, telegramLinkedAt: true, name: true },
    });
    if (paidUser?.telegramUserId && paidUser.telegramLinkedAt) {
      await deliverVipInviteDM(paidUser.telegramUserId, paidUser.name).catch(() => {});
    }

    return jsonResponse(200, { ok: true, granted: true });
  }

  // --- Failed / refunded / expired ---
  if (NOWPAYMENTS_FAILED_STATUSES.has(paymentStatus)) {
    const newStatus = paymentStatus === "refunded" ? "refunded" : paymentStatus === "expired" ? "expired" : "failed";
    await prisma.cryptoPayment.update({ where: { orderId }, data: { status: newStatus } }).catch(() => {});

    // A refund after access was granted must revoke it and remove Telegram access.
    if (paymentStatus === "refunded" && record.status === "paid") {
      await setEntitlementStatus(prisma, record.userId, "vip_membership", "refunded").catch(() => {});
      await syncTelegramAccessForUser(prisma, record.userId, "refunded").catch(() => {});
    }
    return jsonResponse(200, { ok: true, status: newStatus });
  }

  // Intermediate states (waiting, confirming, sending) - acknowledge, no grant.
  return jsonResponse(200, { ok: true, pending: paymentStatus || "unknown" });
}
