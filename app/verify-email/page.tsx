import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { consumeEmailVerificationToken } from "@/lib/auth/verify-email";

export const metadata: Metadata = {
  title: "Verify Email",
  robots: { index: false, follow: false },
  alternates: { canonical: "/verify-email" },
};

const MESSAGES: Record<string, { heading: string; body: string }> = {
  "not-configured": {
    heading: "Verification is not available yet",
    body: "Account verification is being finished. Please try again later or contact support.",
  },
  invalid: {
    heading: "Invalid verification link",
    body: "This verification link is invalid. Please register again or contact support if you already have an account.",
  },
  expired: {
    heading: "Verification link expired",
    body: "This verification link has expired. Please contact support to request a new one.",
  },
  "already-verified": {
    heading: "Email already verified",
    body: "Your email address is already verified. You can sign in now.",
  },
  verified: {
    heading: "Email verified",
    body: "Your email address has been verified. You can now sign in to your account.",
  },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await consumeEmailVerificationToken(token || "");
  const { heading, body } = MESSAGES[result.status];
  const succeeded = result.status === "verified" || result.status === "already-verified";

  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Verify Email" }]} />
        <p className="eyebrow">Account</p>
        <h1>{heading}</h1>
      </div>
      <div className="doc-body">
        <p>{body}</p>
        {succeeded ? (
          <Link className="button" href="/login">Continue to Login</Link>
        ) : (
          <Link className="button secondary" href="/support">Contact Support</Link>
        )}
      </div>
    </div>
  );
}
