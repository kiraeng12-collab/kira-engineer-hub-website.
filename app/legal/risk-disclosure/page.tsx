import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Risk Disclosure",
  description: "Trading risk disclosure for Kira Engineer Hub educational content and memberships.",
  alternates: { canonical: "/legal/risk-disclosure" },
};

export default function RiskDisclosurePage() {
  return (
    <LegalPageLayout title="Risk Disclosure" lastUpdated="4 July 2026">
      <div className="risk-warning">
        <strong>Trading can result in full loss of capital.</strong> Do not trade money you cannot afford to lose.
      </div>
      <p>Financial markets can be volatile, unpredictable and affected by news, liquidity, execution speed, platform stability and broker conditions. Education does not remove risk.</p>
      <h2>Leverage, margin and liquidation</h2>
      <p>Leveraged and margin products can amplify gains and losses. Small market moves may create large losses, margin calls or liquidation.</p>
      <h2>Volatility, liquidity, slippage and execution</h2>
      <p>Prices may move quickly, spreads may widen, liquidity may disappear and orders may execute differently from expected. Backtests, examples and charts may not match live execution.</p>
      <h2>Technical failures</h2>
      <p>Internet outages, broker outages, device problems, delayed data, third-party platform failures and Telegram interruptions may affect decisions or access.</p>
      <h2>Crypto and digital-asset risks</h2>
      <p>Crypto markets may involve extreme volatility, exchange failure, custody risk, smart-contract risk, regulatory restrictions and irreversible transactions.</p>
      <h2>Market commentary limitations</h2>
      <p>Market commentary, scenarios, technical analysis and educational frameworks can be incomplete, delayed or wrong. No guarantee of accuracy, completeness or future results is given.</p>
      <h2>Past performance</h2>
      <p>Past performance, examples, screenshots or historical discussion do not guarantee future performance.</p>
      <h2>User responsibility and advice</h2>
      <p>You remain responsible for all decisions. Consider independent financial, legal, tax or professional advice before trading, especially if you are unsure whether trading is suitable for you.</p>
      <h2>Geographic restrictions</h2>
      <p>Access to products, platforms or markets may be restricted in some countries. Users are responsible for complying with local rules.</p>
    </LegalPageLayout>
  );
}
