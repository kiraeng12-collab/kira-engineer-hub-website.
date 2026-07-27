import type { Metadata } from "next";
import { TelegramMiniApp } from "@/components/tools/TelegramMiniApp";
import { verifySignalToken } from "@/lib/tools/signal-prefill";
import { resolveEntryPrice } from "@/lib/lot-sizing-engine/entry-range";
import "../calculator.css";

export const metadata: Metadata = {
  title: "KIRA Lot Sizing Calculator",
  description: "Risk-controlled position sizing inside Telegram. Powered by Project 242 Risk Technology.",
  robots: { index: false, follow: false },
};

/**
 * Telegram Mini App entry point. A signal's "Calculate My Lot Size" button
 * links here with a signed `?s=` token; we verify it server-side and turn it
 * into a safe prefill. A tampered or expired token is ignored (and, if expired,
 * surfaced as a warning) rather than trusted.
 */
export default async function TelegramCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s } = await searchParams;
  const secret = process.env.LOTSIZE_SIGNAL_SECRET || "";

  let prefill: Record<string, string> | undefined;
  let signalNotice: string | null = null;

  if (s && secret) {
    const verified = verifySignalToken(s, secret);
    if (verified.ok) {
      const p = verified.payload;
      const entry = resolveEntryPrice(p.direction, p.entryMinimum, p.entryMaximum, "worst");
      prefill = {
        instrumentSymbol: p.instrument,
        direction: p.direction,
        entryPrice: String(entry),
        stopLossPrice: String(p.stopLoss),
      };
      if (p.entryType === "RANGE") {
        signalNotice = `Prefilled from signal ${p.signalId}. The worst-case entry (${entry}) in the ${p.entryMinimum}–${p.entryMaximum} range was used. Confirm the live price before trading.`;
      } else {
        signalNotice = `Prefilled from signal ${p.signalId}. Confirm the live price before trading.`;
      }
    } else if (verified.reason === "expired") {
      signalNotice = "This signal link has expired. Prices and levels may have changed — enter the current values before calculating.";
    } else {
      signalNotice = "This signal link could not be verified and was ignored. Enter your trade details manually.";
    }
  }

  return (
    <section className="section" style={{ paddingTop: "clamp(20px, 4vw, 40px)" }}>
      <div className="container">
        <div className="lot-calc">
          <header className="lot-calc__intro">
            <p className="eyebrow">KIRA Risk Technology</p>
            <h1 style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)" }}>Lot Sizing Calculator</h1>
            <p className="lot-calc__powered">Powered by Project 242 Risk Technology</p>
          </header>
          <TelegramMiniApp prefill={prefill} signalNotice={signalNotice} />
        </div>
      </div>
    </section>
  );
}
