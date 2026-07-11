import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Create Account" }]} />
        <p className="eyebrow">Account</p>
        <h1>Create your account.</h1>
        <p className="meta">Create an account to manage KIRA VIP Membership, billing, and Telegram access in one place.</p>
      </div>
      <div className="doc-body">
        <RegisterForm />
        <p className="small-disclosure">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
