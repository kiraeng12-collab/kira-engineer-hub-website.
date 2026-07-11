import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { TelegramLinkButton } from "@/components/account/TelegramLinkButton";

export const metadata: Metadata = { title: "Telegram" };

export default async function AccountTelegramPage() {
  const session = await getServerSession(authOptions);
  const prisma = getPrismaClient();

  const [user, membership] =
    prisma && session?.user?.id
      ? await Promise.all([
          prisma.user.findUnique({
            where: { id: session.user.id },
            select: { telegramUserId: true, telegramUsername: true, telegramLinkedAt: true, telegramRemovedAt: true },
          }),
          prisma.membership.findUnique({ where: { userId: session.user.id }, select: { status: true } }),
        ])
      : [null, null];

  const isActive = membership?.status === "active";
  const isLinked = Boolean(user?.telegramUserId && !user?.telegramRemovedAt);

  return (
    <div>
      <h1>Telegram</h1>
      <p className="meta">Connect your Telegram account to receive KIRA VIP Membership access automatically.</p>

      {isLinked ? (
        <div className="notice">
          <strong>Connected{user?.telegramUsername ? ` as @${user.telegramUsername}` : ""}</strong>
          <br />
          Linked on{" "}
          {user?.telegramLinkedAt?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          . To relink a different Telegram account, contact support.
        </div>
      ) : isActive ? (
        <TelegramLinkButton />
      ) : (
        <div className="notice">
          <strong>Not connected</strong>
          <br />
          Telegram linking is available once your KIRA VIP Membership is active. For now, membership access is
          coordinated manually through Telegram.
        </div>
      )}

      <Link className="button secondary" href="/membership">View Membership</Link>
    </div>
  );
}
