import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { describeEarlyBirdStatus } from "@/lib/early-bird/status";

export const metadata: Metadata = { title: "Early Bird" };

export default async function AccountEarlyBirdPage() {
  const session = await getServerSession(authOptions);
  const prisma = getPrismaClient();

  const request =
    prisma && session?.user?.id
      ? await prisma.earlyBirdRequest.findFirst({
          where: session.user.email
            ? { OR: [{ userId: session.user.id }, { email: session.user.email }] }
            : { userId: session.user.id },
          orderBy: { createdAt: "desc" },
        })
      : null;

  const summary = request ? describeEarlyBirdStatus(request.status) : null;

  return (
    <div>
      <h1>Early Bird</h1>
      <p className="meta">Loyalty pricing eligibility status.</p>

      {request ? (
        <div className="notice">
          <strong>{summary?.heading}</strong>
          <br />
          {summary?.body}
          <br />
          <span className="form-note">Reference: {request.reference}</span>
        </div>
      ) : (
        <div className="notice">
          <strong>Not submitted</strong>
          <br />
          You haven&apos;t submitted an Early Bird eligibility request yet.
        </div>
      )}

      <Link className="button" href="/early-bird">
        {request ? "View Early Bird Terms" : "Check Early Bird Eligibility"}
      </Link>
    </div>
  );
}
