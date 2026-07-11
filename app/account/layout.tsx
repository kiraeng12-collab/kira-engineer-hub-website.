import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
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

  return (
    <AccountLayout name={session.user.name ?? null} email={session.user.email}>
      {children}
    </AccountLayout>
  );
}
