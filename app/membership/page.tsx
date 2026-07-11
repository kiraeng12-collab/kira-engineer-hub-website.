import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ComparisonTable } from "@/components/ComparisonTable";
import { EarlyBirdBadge } from "@/components/EarlyBirdBadge";
import { comparisonColumns, comparisonRows } from "@/lib/config/comparison";
import { siteConfig } from "@/lib/config/site";
import {
  getStandardPriceDisplay,
  getQuarterlyStandardEquivalent,
  getQuarterlySaving,
  getQuarterlyEffectiveMonthly,
  getEarlyBirdPrice,
  getFoundingPrice,
  formatUSD,
} from "@/lib/config/pricing";
import { getCheckoutReadiness } from "@/lib/config/checkout-readiness";

export const metadata: Metadata = {
  title: "KIRA VIP Membership",
  description:
    "KIRA VIP Membership is a private recurring educational membership for structured market discussion, risk-aware planning, and community support.",
  alternates: { canonical: "/membership" },
};

const membershipComparisonRows = comparisonRows.filter((row) =>
  [
    "Private educational analysis",
    "Community discussion",
    "Risk-management framework",
    "Telegram delivery",
    "Recurring membership",
    "Payment model",
  ].includes(row.label)
);

export default function MembershipPage() {
  const readiness = getCheckoutReadiness();
  const quarterlySaving = getQuarterlySaving();

  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Membership" }]} />
        <p className="eyebrow">KIRA VIP Membership</p>
        <h1>Private educational access for disciplined traders.</h1>
        <p className="meta">Structured market discussion, risk-aware planning context, learning resources, and private Telegram access.</p>
      </div>
      <div className="doc-body">
        <section>
          <h2>What KIRA VIP Membership is</h2>
          <p>
            KIRA VIP Membership is a paid recurring educational membership delivered through private Telegram
            access. It focuses on structured market discussion, risk-aware planning, learning resources, and
            community support &mdash; not personalized advice or guaranteed outcomes.
          </p>
        </section>

        <section>
          <h2>Who it is for</h2>
          <ul>
            <li>Traders who want a more structured educational environment.</li>
            <li>Members who value planning, review, and disciplined discussion.</li>
            <li>People who understand that trading risk remains their own responsibility.</li>
          </ul>
          <h2>Who it is not for</h2>
          <ul>
            <li>Anyone looking for guaranteed profits or personal financial advice.</li>
            <li>Anyone seeking account management, copy trading, or broker services.</li>
            <li>Anyone who plans to redistribute private content.</li>
          </ul>
        </section>

        <section>
          <h2>What members receive</h2>
          <ul>
            <li>Structured educational discussion and market context.</li>
            <li>Risk-aware planning resources and scenario-based analysis.</li>
            <li>Regular market updates delivered through private Telegram access.</li>
            <li>Community support from other verified members.</li>
          </ul>
        </section>

        <section>
          <h2>How Telegram delivery works</h2>
          <ol>
            <li>Membership access is requested or paid for through the current activation method.</li>
            <li>Payment or access request is confirmed.</li>
            <li>Telegram username is verified against membership records.</li>
            <li>Private access instructions are sent and access is activated.</li>
          </ol>
          <p className="small-disclosure">Telegram availability and platform rules may affect delivery timing.</p>
        </section>

        <section>
          <h2>Free community vs KIRA VIP Membership</h2>
          <ComparisonTable
            columns={comparisonColumns}
            rows={membershipComparisonRows}
            caption="Feature comparison between Kira Trading Community, KIRA VIP Membership, KIRA Academy, and Project 242"
          />
          <p><Link className="text-link" href="/membership/compare">See the full product comparison</Link></p>
        </section>

        <section className="cards" id="pricing">
          <article className="card">
            <span className="pill">Most Flexible</span>
            <h2>KIRA VIP Monthly</h2>
            <p><strong>{getStandardPriceDisplay("monthly")}</strong></p>
            <p>Monthly educational membership. Online recurring checkout is being prepared.</p>
          </article>
          <article className="card">
            <span className="pill">Best Value</span>
            <h2>KIRA VIP Quarterly</h2>
            <p><strong>{getStandardPriceDisplay("quarterly")}</strong></p>
            <p>
              Standard three-month equivalent: USD {getQuarterlyStandardEquivalent()}. Saving: USD{" "}
              {quarterlySaving.amount}, equal to {quarterlySaving.percentage}%. Equivalent cost: USD{" "}
              {getQuarterlyEffectiveMonthly()} per month.
            </p>
          </article>
          <article className="card">
            <EarlyBirdBadge />
            <h2>Loyalty pricing</h2>
            <p>
              <strong>Founding Members</strong> (joined 2024-2025): {formatUSD(getFoundingPrice("monthly"))} per
              month, or {formatUSD(getFoundingPrice("quarterly"))} every three months.
            </p>
            <p>
              <strong>Early Bird</strong> (joined 2025 through 1 Aug 2026): {formatUSD(getEarlyBirdPrice("monthly"))}{" "}
              per month, or {formatUSD(getEarlyBirdPrice("quarterly"))} every three months.
            </p>
            <Link className="text-link" href="/early-bird">Check Early Bird eligibility</Link>
          </article>
        </section>

        <section className="checkout-panel" id="online-checkout">
          <h2>Online checkout</h2>
          <p className="small-disclosure">
            Checkout is connected to Stripe and remains controlled by the backend safety switch. You&apos;ll need to{" "}
            <Link href="/login?callbackUrl=/membership">sign in</Link> (or{" "}
            <Link href="/register">create an account</Link>) before choosing a plan when checkout is enabled.
          </p>
          <form data-checkout-form>
            <div className="checkout-grid">
              <button className="button" type="submit" name="plan" value="monthly">Pay Monthly VIP</button>
              <button className="button secondary" type="submit" name="plan" value="quarterly">Pay Quarterly VIP</button>
            </div>
            <p className="checkout-status" data-checkout-status aria-live="polite">Online checkout is being prepared. Telegram access remains available.</p>
          </form>
        </section>

        <section>
          <h2>Billing and renewal</h2>
          <p>
            Public pricing is {getStandardPriceDisplay("monthly")} or {getStandardPriceDisplay("quarterly")}. Online
            checkout is currently disabled. When recurring billing is activated, renewal frequency will be shown
            before payment and the selected plan will renew automatically until cancelled.
          </p>
        </section>

        <section>
          <h2>Cancellation</h2>
          <p>
            Cancellation stops future renewals when processed before the next renewal date. Unless required by law
            or stated otherwise, cancellation does not automatically refund already-paid periods and access may
            continue until the end of the paid period. See the{" "}
            <Link href="/legal/refund-policy">Refund and Cancellation Policy</Link> for full detail.
          </p>
        </section>

        <div className="risk-warning">
          <strong>Educational membership only</strong>
          KIRA VIP Membership does not provide personalized investment advice, broker services, investment
          management, or guaranteed results. See the <Link href="/legal/risk-disclosure">Risk Disclosure</Link>.
        </div>

        <section>
          <h2>FAQ</h2>
          <details>
            <summary>How is access delivered?</summary>
            <p>Access is currently coordinated through Telegram while online checkout is being prepared. Confirm renewal, cancellation, and refund terms before payment.</p>
          </details>
          <details>
            <summary>Can I switch between Monthly and Quarterly?</summary>
            <p>Contact membership support before your next renewal to discuss switching plans.</p>
          </details>
          <details>
            <summary>Does membership include KIRA Academy or Project 242?</summary>
            <p>No. KIRA VIP Membership does not include KIRA Academy course access or Project 242 unless expressly stated in a separate official offer.</p>
          </details>
        </section>

        <div className="pricing-actions">
          {readiness.ready ? (
            <a className="button cyan" href="#online-checkout">Continue to Secure Checkout</a>
          ) : (
            <Link className="button cyan" href={siteConfig.social.telegramMembershipSupport}>Request Membership Access</Link>
          )}
          <Link className="button secondary" href="/membership/compare">Compare Products</Link>
        </div>
      </div>
      <Script src="/scripts/checkout-handler.js" strategy="afterInteractive" />
    </div>
  );
}
