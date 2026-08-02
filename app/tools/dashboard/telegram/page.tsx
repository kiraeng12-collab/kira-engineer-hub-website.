import type { Metadata } from "next";
import { LiveDashboard } from "@/components/tools/LiveDashboard";
import "../dashboard.css";

export const metadata: Metadata = {
  title: "KIRA VIP Live Dashboard",
  description: "Live view of KIRA VIP trades — running, closed, and break-even updates. VIP members only.",
  robots: { index: false, follow: false },
};

export default function DashboardTelegramPage() {
  return (
    <section className="section" style={{ paddingTop: "clamp(16px, 4vw, 36px)" }}>
      <div className="container">
        <div style={{ display: "grid", gap: 18 }}>
          <header>
            <p className="eyebrow">KIRA VIP</p>
            <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2.1rem)" }}>Live Trades Dashboard</h1>
            <p style={{ color: "var(--muted)", fontSize: "0.86rem", marginTop: 4 }}>
              Mirrors the KIRA VIP channel in real time.
            </p>
          </header>
          <LiveDashboard />
        </div>
      </div>
    </section>
  );
}
