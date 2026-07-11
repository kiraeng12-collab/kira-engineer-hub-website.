import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getPrismaClient } from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export function extractIpHint(headers: Record<string, unknown> | undefined): string {
  const value = headers?.["x-forwarded-for"];
  return String(Array.isArray(value) ? value[0] : value || "")
    .split(",")[0]
    .trim();
}

// Extracted as a standalone, named function (rather than inlined in the
// CredentialsProvider call) so it can be unit tested directly, independent
// of next-auth's internal provider object shape.
export async function authorizeCredentials(
  credentials: Record<"email" | "password", string> | undefined,
  req: { headers?: Record<string, unknown> } | undefined
) {
  const prisma = getPrismaClient();
  if (!prisma) return null;

  const email = String(credentials?.email || "").trim().toLowerCase();
  const password = String(credentials?.password || "");
  if (!email || !password) return null;

  const ipHint = extractIpHint(req?.headers);
  const emailLimit = await checkRateLimit(prisma, { bucket: `login:email:${email}`, windowMinutes: 15, max: 8 });
  if (emailLimit.limited) throw new Error("TOO_MANY_ATTEMPTS");
  if (ipHint) {
    const ipLimit = await checkRateLimit(prisma, { bucket: `login:ip:${ipHint}`, windowMinutes: 15, max: 20 });
    if (ipLimit.limited) throw new Error("TOO_MANY_ATTEMPTS");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) return null;

  if (!user.emailVerified) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  return { id: user.id, email: user.email, name: user.name };
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
