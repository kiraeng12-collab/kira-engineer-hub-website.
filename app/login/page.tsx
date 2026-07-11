import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sign In" }]} />
        <p className="eyebrow">Account</p>
        <h1>Sign in to your account.</h1>
      </div>
      <div className="doc-body">
        <Suspense fallback={<p>Loading...</p>}>
          <LoginForm />
        </Suspense>
        <p className="small-disclosure">
          <Link href="/forgot-password">Forgot your password?</Link>
        </p>
        <p className="small-disclosure">
          Don&apos;t have an account? <Link href="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
