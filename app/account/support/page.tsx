import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Support" };

export default function AccountSupportPage() {
  return (
    <div>
      <h1>Support</h1>
      <p className="meta">Get help with your account, membership, or billing.</p>
      <section className="cards">
        <article className="card">
          <h2>Support Centre</h2>
          <p>Self-service guidance for membership, billing, and Telegram issues.</p>
          <Link className="button secondary" href="/support">Visit Support Centre</Link>
        </article>
        <article className="card">
          <h2>Contact Us</h2>
          <p>Send a direct enquiry to the team.</p>
          <Link className="button secondary" href="/contact">Contact Form</Link>
        </article>
        <article className="card">
          <h2>Complaints</h2>
          <p>Submit a formal complaint if something hasn&apos;t been resolved.</p>
          <Link className="button secondary" href="/complaints">Complaints Procedure</Link>
        </article>
      </section>
    </div>
  );
}
