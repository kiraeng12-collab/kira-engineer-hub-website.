import type { PrismaClient } from "@/lib/generated/prisma";
import { getActiveProducts } from "@/lib/entitlements/service";
import { checkConsentForProducts } from "@/lib/agreements/service";

export type VipAccessResult =
  | { ok: true }
  | { ok: false; reason: "no_membership" }
  | { ok: false; reason: "agreements_pending_counsel" }
  | {
      ok: false;
      reason: "consent_missing";
      missing: { key: string; title: string; version: string; href: string }[];
    };

/**
 * The single gate for handing out VIP Telegram access, shared by the
 * access-key route and the resend-invites route so the two can never drift
 * apart — a second copy of this check is a second place to forget a rule.
 */
export async function checkVipTelegramAccess(
  prisma: PrismaClient,
  userId: string
): Promise<VipAccessResult> {
  // Entitlements are the source of truth; the legacy Membership row is still
  // honoured so members who paid before the entitlement backfill are not
  // locked out. Drop the fallback once every active membership has a row.
  const activeProducts = await getActiveProducts(prisma, userId);
  let hasVip = activeProducts.includes("vip_membership");
  if (!hasVip) {
    const membership = await prisma.membership.findUnique({ where: { userId } });
    hasVip = membership?.status === "active";
  }
  if (!hasVip) return { ok: false, reason: "no_membership" };

  // Consent gate: access is only granted once the member has accepted every
  // agreement VIP requires, at its current version. This is what makes "you
  // cannot join without agreeing" a technical guarantee rather than a policy.
  // Scoped to vip_membership deliberately — a pending agreement on an
  // unrelated product must not block VIP access.
  const consent = await checkConsentForProducts(prisma, userId, ["vip_membership"]);
  if (!consent.ok) {
    if (consent.reason === "agreements_pending_counsel") {
      return { ok: false, reason: "agreements_pending_counsel" };
    }
    return {
      ok: false,
      reason: "consent_missing",
      missing: consent.missing.map((a) => ({
        key: a.key,
        title: a.title,
        version: a.version,
        href: a.href,
      })),
    };
  }

  return { ok: true };
}
