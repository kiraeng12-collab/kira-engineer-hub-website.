import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { hasEntitlement } from "@/lib/entitlements/service";
import { getMemberCopyStatus, getMemberAccessKey } from "@/lib/copy-bridge/status";
import { getCopySettings } from "@/lib/copy-bridge/settings";
import { CopyKeyReveal } from "@/components/account/CopyKeyReveal";
import { CopySettingsForm } from "@/components/account/CopySettingsForm";

// Members-only add-on area. Never indexed; not linked publicly.
export const metadata: Metadata = { title: "Copy Trading", robots: { index: false, follow: false } };

const STATUS_LABEL: Record<string, string> = {
  COPYING: "Copying active",
  MANUAL_REVIEW: "Awaiting your decision",
  BLOCKED_RISK: "Paused by a risk limit",
  REJECTED: "Last trade rejected",
  EXPIRED: "Last trade expired",
  CONNECTED: "Connected · waiting",
  OFFLINE: "Copier offline",
};

function fmtDate(d: Date | null | undefined) {
  return d ? d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null;
}

function money(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency || ""}`.trim();
  }
}

export default async function CopyTradingPage() {
  const session = await getServerSession(authOptions);
  const prisma = getPrismaClient();
  if (!prisma || !session?.user?.id) redirect("/account");

  const userId = session.user.id;

  // Gate: only members who hold the copy-trading add-on ever see this area.
  const entitled = await hasEntitlement(prisma, userId, "copy_trading");
  if (!entitled) redirect("/account");

  const [entRow, status, accessKey, settingsView] = await Promise.all([
    prisma.entitlement.findUnique({
      where: { userId_product: { userId, product: "copy_trading" } },
      select: { currentPeriodEnd: true },
    }),
    getMemberCopyStatus(userId),
    getMemberAccessKey(userId),
    getCopySettings(userId),
  ]);

  const renews = fmtDate(entRow?.currentPeriodEnd ?? null);
  const statusText = status.registered
    ? (status.online ? (status.status ? STATUS_LABEL[status.status] ?? status.statusLabel ?? "Connected" : "Connected") : "Copier offline")
    : "Not set up yet";

  return (
    <div>
      <h1>Copy Trading</h1>
      <p className="meta">
        Your Copy Trading add-on lets your MetaTrader 5 mirror the KIRA master account, on your own broker and settings.
      </p>

      {/* Add-on status */}
      <div className="notice">
        <strong>Add-on active{renews ? ` · renews ${renews}` : ""}</strong>
        <br />
        Copier status: <strong>{statusText}</strong>
        {status.registered && status.online && status.lotRule ? ` · Lot rule: ${status.lotRule}` : ""}
        {status.mode ? ` · ${status.mode === "LIVE" ? "Live" : "Demo (safe)"} mode` : ""}
      </div>

      {/* Your account + performance — only shown once the copier reports telemetry */}
      {status.telemetry ? (
        <>
          <h2 style={{ marginTop: 28 }}>Your account</h2>
          <p className="meta">
            Reported by your copier{status.telemetry.fresh ? "" : ` · ${status.telemetry.secondsSinceReport}s ago (may be stale)`}.
          </p>
          <div className="account-stats">
            <div><span>Balance</span><strong>{money(status.telemetry.balance, status.telemetry.currency)}</strong></div>
            <div><span>Equity</span><strong>{money(status.telemetry.equity, status.telemetry.currency)}</strong></div>
            <div><span>Margin</span><strong>{money(status.telemetry.margin, status.telemetry.currency)}</strong></div>
            <div><span>Margin level</span><strong>{status.telemetry.marginLevel > 0 ? `${status.telemetry.marginLevel.toFixed(0)}%` : "—"}</strong></div>
            <div><span>Open positions</span><strong>{status.telemetry.openPositions}</strong></div>
          </div>

          <h2 style={{ marginTop: 24 }}>Performance</h2>
          <p className="meta">Realized profit or loss on your account.</p>
          <div className="account-stats">
            <div>
              <span>Today</span>
              <strong className={status.telemetry.pnlToday >= 0 ? "pnl-pos" : "pnl-neg"}>{money(status.telemetry.pnlToday, status.telemetry.currency)}</strong>
            </div>
            <div>
              <span>All time</span>
              <strong className={status.telemetry.pnlTotal >= 0 ? "pnl-pos" : "pnl-neg"}>{money(status.telemetry.pnlTotal, status.telemetry.currency)}</strong>
            </div>
          </div>
        </>
      ) : null}

      {/* Access key */}
      {accessKey ? (
        <CopyKeyReveal accessKey={accessKey} />
      ) : (
        <div className="notice">
          <strong>Access key</strong>
          <br />
          Your access key is being prepared. If it doesn&apos;t appear shortly after your add-on activates, contact support.
        </div>
      )}

      {/* Copy settings — managed here, applied by the copier automatically */}
      <h2 style={{ marginTop: 28 }}>Copy settings</h2>
      <p className="meta">Choose how your trades are sized. These are applied by your copier automatically — you don&apos;t need to change anything in MetaTrader.</p>
      {settingsView.available ? (
        <CopySettingsForm settings={settingsView.settings} ceilings={settingsView.ceilings} />
      ) : (
        <div className="notice">
          <strong>Settings available once your copier connects</strong>
          <br />
          Finish setup below and open your copier at least once; your settings will appear here.
        </div>
      )}

      {/* Download + setup */}
      <h2 style={{ marginTop: 28 }}>Set up your copier</h2>
      <p className="meta">Run the copier on MetaTrader 5 (Windows desktop or a Windows VPS — the MT5 mobile app can&apos;t run it).</p>
      <ol className="steps">
        <li>Download the copier package and open the included setup guide.</li>
        <li>In MT5, allow the connection and add the copier to a chart.</li>
        <li>Enter your <strong>Bridge URL</strong>, <strong>Member ID</strong> and the <strong>access key</strong> above.</li>
        <li>Start on a demo account, choose your lot rule, then enable copying.</li>
      </ol>
      <div className="actions">
        <a className="button" href="/downloads/kira-member-package.zip" download>Download copier</a>
        <Link className="button secondary" href="/account/support">Get help</Link>
      </div>

      <p className="form-note" style={{ marginTop: 18 }}>
        Trading involves substantial risk of loss. The copier mirrors trades and does not guarantee performance or results.
      </p>
    </div>
  );
}
