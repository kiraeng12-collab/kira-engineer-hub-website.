import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { getStandardPriceDisplay, getEarlyBirdPriceDisplay, getFoundingPriceDisplay, type PlanId } from "@/lib/config/pricing";
import { SubscribeButtons } from "@/components/account/SubscribeButtons";

export const metadata: Metadata = { title: "Membership" };

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  past_due: "Payment past due",
  cancelled: "Cancelled",
  expired: "Expired",
  suspended: "Suspended",
  refunded: "Refunded",
  disputed: "Under dispute review",
};

function priceDisplayForTier(plan: PlanId, tier: string | null): string {
  if (tier === "founding") return getFoundingPriceDisplay(plan);
  if (tier === "early_bird") return getEarlyBirdPriceDisplay(plan);
  return getStandardPriceDisplay(plan);
}

const TIER_LABELS: Record<string, string> = {
  founding: " (Founding Member pricing)",
  early_bird: " (Early Bird pricing applied)",
};

export default async function AccountMembershipPage() {
  const session = await getServerSession(authOptions);
  const prisma = getPrismaClient();
  const [membership, user] =
    prisma && session?.user?.id
      ? await Promise.all([
          prisma.membership.findUnique({ where: { userId: session.user.id } }),
          prisma.user.findUnique({ where: { id: session.user.id }, select: { membershipTier: true } }),
        ])
      : [null, null];

  return (
    <div>
      <h1>Membership</h1>
      <p className="meta">Your KIRA VIP Membership plan and status.</p>

      {membership ? (
        <>
          <div className="notice">
            <strong>{STATUS_LABELS[membership.status] || membership.status}</strong>
            <br />
            Plan: {priceDisplayForTier(membership.plan === "monthly" ? "monthly" : "quarterly", membership.tier)}
            {membership.tier ? TIER_LABELS[membership.tier] || "" : ""}
            <br />
            {membership.currentPeriodEnd
              ? `Renews: ${new Date(membership.currentPeriodEnd).toLocaleDateString()}`
              : null}
            {membership.cancelAtPeriodEnd ? <><br />Cancellation scheduled at the end of the current period.</> : null}
          </div>
          <div className="actions">
            <Link className="button secondary" href="/account/billing">Manage Billing</Link>
          </div>
        </>
      ) : (
        <>
          <div className="notice">
            <strong>No active membership</strong>
            <br />
            You don&apos;t have an active KIRA VIP Membership yet. Online checkout is being prepared - in the
            meantime, membership access is coordinated through Telegram.
          </div>
          <SubscribeButtons tier={user?.membershipTier === "founding" || user?.membershipTier === "early_bird" ? user.membershipTier : null} />
          <div className="actions">
            <Link className="button secondary" href="/membership">Compare Plans</Link>
            <Link className="button secondary" href="/account/early-bird">Check Early Bird eligibility</Link>
          </div>
        </>
      )}
    </div>
  );
}
