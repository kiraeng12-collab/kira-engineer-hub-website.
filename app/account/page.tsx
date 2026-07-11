import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";

export const metadata: Metadata = { title: "Account Overview" };

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

export default async function AccountOverviewPage() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name;
  const email = session?.user?.email;
  const prisma = getPrismaClient();
  const membership =
    prisma && session?.user?.id
      ? await prisma.membership.findUnique({ where: { userId: session.user.id } })
      : null;

  return (
    <div>
      <h1>Account overview</h1>
      <p className="meta">Welcome back{name ? `, ${name}` : ""}.</p>

      <section className="cards">
        <article className="card">
          <span className="pill">Verified</span>
          <h2>Account</h2>
          <p>{email}</p>
          <p className="small-disclosure">Email verified.</p>
          <Link className="text-link" href="/account/profile">Edit profile</Link>
        </article>
        <article className="card">
          <span className="pill">{membership ? STATUS_LABELS[membership.status] || membership.status : "No active membership"}</span>
          <h2>KIRA VIP Membership</h2>
          <p>{membership ? `Plan: ${membership.plan === "monthly" ? "Monthly" : "Quarterly"}` : "You don't have an active membership yet."}</p>
          <Link className="text-link" href="/account/membership">
            {membership ? "Manage Membership" : "Explore Membership"}
          </Link>
        </article>
        <article className="card">
          <span className="pill">Not connected</span>
          <h2>Telegram</h2>
          <p>Connect your Telegram account once your membership is active.</p>
          <Link className="text-link" href="/account/telegram">Manage Telegram</Link>
        </article>
        <article className="card">
          <span className="pill">Not submitted</span>
          <h2>Early Bird</h2>
          <p>Check your eligibility for loyalty pricing.</p>
          <Link className="text-link" href="/account/early-bird">Check Early Bird status</Link>
        </article>
      </section>

      <div className="hero-panel">
        <h2>Need help?</h2>
        <div className="actions">
          <Link className="button secondary" href="/support">Support Centre</Link>
          <Link className="button secondary" href="/contact">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
