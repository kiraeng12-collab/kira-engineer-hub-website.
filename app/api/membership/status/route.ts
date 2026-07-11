import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return jsonResponse(401, { message: "Please sign in first." });

  const prisma = getPrismaClient();
  if (!prisma) return jsonResponse(503, { message: "Membership status is not configured yet." });

  const membership = await prisma.membership.findUnique({ where: { userId: session.user.id } });

  if (!membership) {
    return jsonResponse(200, { active: false, membership: null });
  }

  return jsonResponse(200, {
    active: membership.status === "active",
    membership: {
      plan: membership.plan,
      status: membership.status,
      currentPeriodEnd: membership.currentPeriodEnd,
      cancelAtPeriodEnd: membership.cancelAtPeriodEnd,
      earlyBirdApplied: membership.earlyBirdApplied,
    },
  });
}
