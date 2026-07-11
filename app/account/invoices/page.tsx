import type { Metadata } from "next";

export const metadata: Metadata = { title: "Invoices" };

export default function AccountInvoicesPage() {
  return (
    <div>
      <h1>Invoices</h1>
      <p className="meta">Your KIRA VIP Membership payment history.</p>
      <div className="notice">
        <strong>No invoices yet</strong>
        <br />
        Invoices will appear here once you have an active paid membership.
      </div>
    </div>
  );
}
