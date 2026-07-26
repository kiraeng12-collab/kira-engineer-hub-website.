import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { getStripeClient } from "@/lib/stripe/client";

export const metadata: Metadata = { title: "Invoices" };

type Row = {
  date: Date;
  description: string;
  amount: string;
  status: string;
  method: "Card" | "Crypto";
  url: string | null;
};

const STRIPE_STATUS: Record<string, string> = {
  paid: "Paid",
  open: "Open",
  void: "Void",
  uncollectible: "Uncollectible",
  draft: "Draft",
};

const CRYPTO_STATUS: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  confirming: "Confirming",
  failed: "Failed",
  expired: "Expired",
  refunded: "Refunded",
};

function money(amount: number, currency: string): string {
  return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
}

export default async function AccountInvoicesPage() {
  const session = await getServerSession(authOptions);
  const prisma = getPrismaClient();
  const rows: Row[] = [];

  if (prisma && session?.user?.id) {
    const [user, cryptoPayments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { stripeCustomerId: true },
      }),
      prisma.cryptoPayment.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Card invoices from Stripe (best-effort - a Stripe hiccup must not break
    // the page or hide the crypto history).
    const stripe = getStripeClient();
    if (stripe && user?.stripeCustomerId) {
      try {
        const invoices = await stripe.invoices.list({ customer: user.stripeCustomerId, limit: 100 });
        for (const inv of invoices.data) {
          const paid = (inv.amount_paid || inv.amount_due || 0) / 100;
          rows.push({
            date: new Date((inv.created || 0) * 1000),
            description: "KIRA VIP Membership",
            amount: money(paid, inv.currency || "usd"),
            status: STRIPE_STATUS[inv.status || ""] || inv.status || "—",
            method: "Card",
            url: inv.hosted_invoice_url || inv.invoice_pdf || null,
          });
        }
      } catch {
        // Ignore - Stripe unavailable; crypto rows still render.
      }
    }

    // Crypto payments from our own records (no external invoice document).
    for (const p of cryptoPayments) {
      rows.push({
        date: p.paidAt || p.createdAt,
        description: `KIRA VIP Membership (${p.plan})`,
        amount: `${p.amount.toFixed(2)} USDT`,
        status: CRYPTO_STATUS[p.status] || p.status,
        method: "Crypto",
        url: null,
      });
    }
  }

  rows.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div>
      <h1>Invoices</h1>
      <p className="meta">Your KIRA VIP Membership payment history.</p>

      {rows.length === 0 ? (
        <div className="notice">
          <strong>No invoices yet</strong>
          <br />
          Invoices will appear here once you have a paid membership. Card payments also appear in the{" "}
          <Link href="/account/billing">billing portal</Link>.
        </div>
      ) : (
        <>
          <div className="table-scroll">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                    <td>{row.description}</td>
                    <td>{row.method}</td>
                    <td>{row.amount}</td>
                    <td>{row.status}</td>
                    <td>
                      {row.url ? (
                        <a href={row.url} target="_blank" rel="noopener noreferrer">View / PDF</a>
                      ) : row.method === "Crypto" ? (
                        "Receipt by email"
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small-disclosure">
            Card invoices are issued by Stripe — manage your payment method and download full invoices in the{" "}
            <Link href="/account/billing">billing portal</Link>. Crypto payments are one-time and confirmed by the
            payment processor.
          </p>
        </>
      )}
    </div>
  );
}
