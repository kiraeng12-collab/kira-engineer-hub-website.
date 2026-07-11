import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { ManageBillingButton } from "@/components/account/ManageBillingButton";

export const metadata: Metadata = { title: "Billing" };

export default async function AccountBillingPage() {
  const session = await getServerSession(authOptions);
  const prisma = getPrismaClient();
  const user =
    prisma && session?.user?.id
      ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { stripeCustomerId: true } })
      : null;

  return (
    <div>
      <h1>Billing</h1>
      <p className="meta">Manage your payment method and subscription billing.</p>

      {user?.stripeCustomerId ? (
        <>
          <p>Manage your payment method, view invoices, and cancel or update your subscription through Stripe&apos;s secure billing portal.</p>
          <ManageBillingButton />
        </>
      ) : (
        <div className="notice">
          <strong>No billing information on file</strong>
          <br />
          Once you start a KIRA VIP Membership subscription, you&apos;ll be able to manage your payment method and
          billing here through the Stripe Customer Portal.
        </div>
      )}

      <p className="small-disclosure">
        Kira Engineer Hub never stores your card details directly - billing is handled securely by Stripe.
      </p>
      <Link className="text-link" href="/legal/refund-policy">Refund and Cancellation Policy</Link>
    </div>
  );
}
