import type { Metadata } from "next";
import { LotSizeCalculator } from "@/components/tools/LotSizeCalculator";
import "./calculator.css";

export const metadata: Metadata = {
  title: "KIRA Lot Sizing Calculator",
  description:
    "Calculate a risk-controlled position size from your account, stop-loss, and chosen KIRA risk mode. Powered by Project 242 Risk Technology.",
  // Launching on Telegram first; the website version stays unlisted (reachable
  // by direct URL, not indexed or linked) until the public website launch.
  robots: { index: false, follow: false },
};

export default function LotSizingCalculatorPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="lot-calc">
          <header className="lot-calc__intro">
            <p className="eyebrow">KIRA Risk Technology</p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>KIRA Lot Sizing Calculator</h1>
            <p className="lot-calc__powered">Powered by Project 242 Risk Technology</p>
            <p style={{ maxWidth: 620, marginTop: 14, color: "var(--stone)" }}>
              A trading opportunity should not determine the lot size. The amount you can responsibly risk should. Enter
              your account and trade, and KIRA returns a stress-tested position that stays within your selected risk
              parameters — or tells you when no safe position exists.
            </p>
          </header>

          <LotSizeCalculator />
        </div>
      </div>
    </section>
  );
}
