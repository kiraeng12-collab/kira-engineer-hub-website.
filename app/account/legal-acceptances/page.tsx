import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { legalConfig } from "@/lib/config/legal";

export const metadata: Metadata = { title: "Legal Acceptances" };

export default async function AccountLegalAcceptancesPage() {
  const session = await getServerSession(authOptions);
  const prisma = getPrismaClient();
  const user =
    prisma && session?.user?.id
      ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { termsAcceptedAt: true } })
      : null;

  return (
    <div>
      <h1>Legal Acceptances</h1>
      <p className="meta">A record of the legal documents you&apos;ve accepted and their current version.</p>
      <div className="tblwrap">
        <table>
          <thead>
            <tr><th>Document</th><th>Version</th><th>Accepted</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Terms of Use</td>
              <td>{legalConfig.termsVersion}</td>
              <td>{user?.termsAcceptedAt ? new Date(user.termsAcceptedAt).toLocaleDateString() : "Not recorded"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="small-disclosure">
        If our Terms of Use, Membership Terms, or Risk Disclosure are updated, you may be asked to review and accept
        the new version before continuing.
      </p>
    </div>
  );
}
