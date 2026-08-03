import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { verifyClaimToken, applyLoyaltyClaim, VIP_CLAIM_COOKIE } from "@/lib/telegram/loyalty-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Landing point for the bot's signed /vip discount link.
 *
 * Signed in  -> apply the loyalty tier now, then send them to checkout.
 * Signed out -> stash the (already-verified) signed token in an httpOnly cookie
 *               and send them to sign in / create an account; the membership
 *               page applies it once they're authenticated.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get("d");
  const membershipUrl = new URL("/account/membership", url.origin);

  const verified = verifyClaimToken(token);
  if (!verified) {
    // Bad or expired link — just drop them on the membership page at standard
    // pricing; they can still claim the normal way.
    return NextResponse.redirect(membershipUrl);
  }

  const session = await getServerSession(authOptions);
  const prisma = getPrismaClient();

  if (session?.user?.id && prisma) {
    await applyLoyaltyClaim(prisma, session.user.id, verified.telegramUserId).catch((e) =>
      console.error("vip-claim apply failed:", e instanceof Error ? e.message : e)
    );
    return NextResponse.redirect(membershipUrl);
  }

  // Not signed in yet — carry the claim through registration/login.
  const loginUrl = new URL("/login", url.origin);
  loginUrl.searchParams.set("callbackUrl", "/account/membership");
  const res = NextResponse.redirect(loginUrl);
  res.cookies.set(VIP_CLAIM_COOKIE, token as string, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
  return res;
}
