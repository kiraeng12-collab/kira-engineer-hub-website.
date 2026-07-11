import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Weekly Analysis Archive",
  description:
    "Weekly analysis archive for educational market context from Kira Engineer Hub. Reports are not trade recommendations or guaranteed outcomes.",
  alternates: { canonical: "/weekly-analysis" },
};

export default function WeeklyAnalysisPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Weekly Analysis" }]} />
        <p className="eyebrow">Archive Preparing</p>
        <h1>Weekly analysis archive.</h1>
        <p className="meta">Future reports may cover XAUUSD, BTCUSD, XAGUSD, US indices, and macro outlooks when ready.</p>
      </div>
      <div className="doc-body">
        <div className="hero-panel">
          <h2>Report format</h2>
          <ul>
            <li>Macro overview and important events.</li>
            <li>Bullish and bearish scenarios.</li>
            <li>Important levels and risk considerations.</li>
            <li>Clear educational disclaimer.</li>
          </ul>
        </div>
        <div className="risk-warning">
          <strong>Educational context only</strong>
          Weekly analysis is not a signal service, personal recommendation, or guarantee of market outcome.
        </div>
      </div>
    </div>
  );
}
