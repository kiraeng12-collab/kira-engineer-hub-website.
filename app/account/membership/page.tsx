import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { getStandardPriceDisplay } from "@/lib/config/pricing";
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

export default async function AccountMembershipPage() {
  const session = await getServerSession(authOptions);
  const prisma = getPrismaClient();
  const membership =
    prisma && session?.user?.id
      ? await prisma.membership.findUnique({ where: { userId: session.user.id } })
      : null;

  return (
    <div>
      <h1>Membership</h1>
      <p className="meta">Your KIRA VIP Membership plan and status.</p>

      {membership ? (
        <>
          <div className="notice">
            <strong>{STATUS_LABELS[membership.status] || membership.status}</strong>
            <br />
            Plan: {membership.plan === "monthly" ? getStandardPriceDisplay("monthly") : getStandardPriceDisplay("quarterly")}
            {membership.earlyBirdApplied ? " (Early Bird pricing applied)" : ""}
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
          <SubscribeButtons />
          <div className="actions">
            <Link className="button secondary" href="/membership">Compare Plans</Link>
            <Link className="button secondary" href="/account/early-bird">Check Early Bird eligibility</Link>
          </div>
        </>
      )}
    </div>
  );
}
