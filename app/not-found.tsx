import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <p className="eyebrow">404</p>
        <h1>Page not found.</h1>
        <p className="meta">The page may have moved, or the link may no longer be active.</p>
      </div>
      <div className="doc-body">
        <div className="actions">
          <Link className="button" href="/">Return home</Link>
          <Link className="button secondary" href="/legal">View Legal Center</Link>
        </div>
      </div>
    </div>
  );
}
