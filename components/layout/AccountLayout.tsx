"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const ACCOUNT_NAV = [
  { href: "/account", label: "Overview" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/membership", label: "Membership" },
  { href: "/account/billing", label: "Billing" },
  { href: "/account/invoices", label: "Invoices" },
  { href: "/account/telegram", label: "Telegram" },
  { href: "/account/early-bird", label: "Early Bird" },
  { href: "/account/preferences", label: "Preferences" },
  { href: "/account/legal-acceptances", label: "Legal Acceptances" },
  { href: "/account/support", label: "Support" },
];

export function AccountLayout({
  name,
  email,
  children,
}: {
  name: string | null;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="doc-page account-shell">
      <div className="account-sidebar">
        <div className="account-identity">
          <strong>{name || email}</strong>
          <span className="muted">{email}</span>
        </div>
        <nav className="account-nav" aria-label="Account navigation">
          {ACCOUNT_NAV.map((item) => {
            const isActive = item.href === "/account" ? pathname === "/account" : pathname === item.href;
            return (
              <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button type="button" className="button secondary account-signout" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign Out
        </button>
      </div>
      <div className="account-content doc-body">{children}</div>
    </div>
  );
}
