import { getPrismaClient } from "@/lib/db/prisma";
import { hashToken, isExpired } from "./tokens";

export type VerifyEmailResult =
  | { status: "not-configured" }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "already-verified" }
  | { status: "verified" };

export async function consumeEmailVerificationToken(rawToken: string): Promise<VerifyEmailResult> {
  const prisma = getPrismaClient();
  if (!prisma) return { status: "not-configured" };
  if (!rawToken) return { status: "invalid" };

  const tokenHash = hashToken(rawToken);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) return { status: "invalid" };

  if (record.usedAt) {
    return record.user.emailVerified ? { status: "already-verified" } : { status: "invalid" };
  }

  if (isExpired(record.expiresAt)) {
    return { status: "expired" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { status: "verified" };
}
