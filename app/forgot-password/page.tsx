import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  robots: { index: false, follow: false },
  alternates: { canonical: "/forgot-password" },
};

export default function ForgotPasswordPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Forgot Password" }]} />
        <p className="eyebrow">Account</p>
        <h1>Reset your password.</h1>
        <p className="meta">Enter your account email and we&apos;ll send a link to reset your password.</p>
      </div>
      <div className="doc-body">
        <ForgotPasswordForm />
        <p className="small-disclosure">
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
