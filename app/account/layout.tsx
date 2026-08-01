import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { hasEntitlement } from "@/lib/entitlements/service";
import { AccountLayout } from "@/components/layout/AccountLayout";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AccountRootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Defense in depth alongside middleware.ts - never render account content
  // without a verified session.
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/account");
  }

  // The Copy Trading area is a members-only add-on: only surface it to members
  // who actually hold the entitlement, so it stays invisible to everyone else.
  const prisma = getPrismaClient();
  const showCopyTrading =
    prisma && session.user.id ? await hasEntitlement(prisma, session.user.id, "copy_trading") : false;

  return (
    <AccountLayout name={session.user.name ?? null} email={session.user.email} showCopyTrading={showCopyTrading}>
      {children}
    </AccountLayout>
  );
}
