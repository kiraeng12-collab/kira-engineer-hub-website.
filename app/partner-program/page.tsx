import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { PartnerCta } from "@/components/partner/PartnerCta";
import { PartnerSectionNav } from "@/components/partner/PartnerSectionNav";
import { PartnerFaq } from "@/components/partner/PartnerFaq";
import { PartnerCommissionEstimate } from "@/components/partner/PartnerCommissionEstimate";
import { PartnerApplicationForm } from "@/components/partner/PartnerApplicationForm";
import { pricingConfig, getStandardPrice } from "@/lib/config/pricing";

export const metadata: Metadata = {
  title: "KIRA Partner Network | Creator & Community Partnerships",
  description:
    "Apply to the KIRA Partner Network and earn transparent commission by responsibly introducing suitable audiences to Kira Engineer Hub educational memberships.",
  alternates: { canonical: "/partner-program" },
  openGraph: {
    title: "KIRA Partner Network | Creator & Community Partnerships",
    description:
      "A selective network for creators, educators, communities and publishers. Transparent recurring commission on eligible KIRA VIP Membership revenue.",
    url: "/partner-program",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KIRA Partner Network",
    description:
      "Transparent commission for responsibly introducing suitable audiences to Kira Engineer Hub educational memberships.",
  },
};

const NAV_ITEMS = [
  { id: "how", label: "How it works" },
  { id: "commission", label: "Commission" },
  { id: "tools", label: "What you get" },
  { id: "standards", label: "Standards" },
  { id: "faq", label: "FAQ" },
  { id: "apply", label: "Apply" },
];

const FACTS = [
  { value: "20%", label: "Recurring commission" },
  { value: "12", label: "Eligible billing cycles" },
  { value: "30 days", label: "Referral attribution" },
  { value: "Monthly", label: "Validated payouts" },
];

const PHILOSOPHY = [
  { title: "Transparent Earnings", body: "Understand how eligible referrals, commissions, validation, and payouts are calculated." },
  { title: "Relevant Audiences", body: "Promote KIRA only where its educational membership genuinely matches the audience's interests." },
  { title: "Responsible Promotion", body: "Use clear disclosures and avoid exaggerated performance claims, misleading urgency, or guaranteed outcomes." },
  { title: "Long-Term Alignment", body: "Build sustainable value through credible content, community trust, and properly qualified referrals." },
];

const AUDIENCE = [
  { title: "Content Creators", body: "Trading, finance, business, technology, risk-management, productivity, and educational content creators." },
  { title: "Community Leaders", body: "Owners or administrators of relevant Telegram, Discord, social-media, professional, or educational communities." },
  { title: "Educators and Publishers", body: "Educators, analysts, newsletters, websites, podcasts, and media platforms with relevant audiences." },
  { title: "Strategic Organisations", body: "Aligned companies, platforms, service providers, or organisations interested in a tailored commercial or educational collaboration." },
];

const NOT_SUITABLE = [
  "Individuals promising guaranteed trading profits.",
  "Unverified paid-lead networks.",
  "Spam, unsolicited messaging, or misleading advertising operations.",
  "Signal resellers or private-content redistributors.",
  "Websites impersonating Kira Engineer Hub.",
  "Partners seeking commissions from broker deposits or trading activity.",
  "Individuals attempting self-referrals or fraudulent attribution.",
];

const STEPS = [
  { n: "01", title: "Apply", body: "Tell us about your audience, promotional channels, experience, and proposed partnership approach." },
  { n: "02", title: "Review", body: "Kira Engineer Hub manually reviews audience relevance, brand alignment, compliance readiness, and promotional quality." },
  { n: "03", title: "Activate", body: "Approved partners receive their unique referral link or code, onboarding guidance, approved assets, and access to available reporting tools." },
  { n: "04", title: "Grow", body: "Introduce qualified audiences to KIRA, monitor eligible referrals, and receive validated commission payments according to the Partner Terms." },
];

const COMMISSION_TABLE = [
  { k: "Commission rate", v: "20%" },
  { k: "Commission period", v: "First 12 successful billing cycles" },
  { k: "Attribution period", v: "30 days" },
  { k: "Validation period", v: "30 days" },
  { k: "Payout schedule", v: "Monthly" },
  { k: "Minimum payout balance", v: "USD 50" },
  { k: "Customer eligibility", v: "New qualified customers" },
  { k: "Strategic partnerships", v: "Custom written agreement" },
];

const TOOLS = [
  { title: "Unique Referral Access", body: "An approved tracking link, promotional code, or campaign identifier." },
  { title: "Performance Reporting", body: "Reporting access is provided according to the tracking system available to the approved partner, covering eligible clicks, referrals, pending and approved commissions, and payout history." },
  { title: "Approved Media Kit", body: "Current logos, brand guidelines, disclosure wording, campaign graphics, and approved descriptions." },
  { title: "Campaign Guidance", body: "Clear information about eligible products, positioning, prohibited claims, and current campaigns." },
  { title: "Partner Support", body: "A defined communication channel for partnership, tracking, compliance, and campaign questions." },
  { title: "Growth Opportunities", body: "Selected high-quality partners may be considered for tailored campaigns, co-created content, or strategic agreements. Access is not guaranteed." },
];

const MUST = [
  "Clearly disclose their commercial relationship with Kira Engineer Hub.",
  "Present KIRA products accurately.",
  "Use only approved brand assets.",
  "Keep confidential information private.",
  "Respect applicable advertising, privacy, tax, and consumer-protection requirements.",
  "Direct customers to official Kira Engineer Hub checkout pages.",
  "Immediately correct inaccurate or outdated promotional content when requested.",
];

const MUST_NOT = [
  "Guarantee profits, returns, accuracy, success, or financial outcomes.",
  "Fabricate testimonials, reviews, customer numbers, or trading results.",
  "Present educational material as personalized investment advice.",
  "Suggest that Kira Engineer Hub is a broker, regulated investment adviser, investment manager, or account-management service.",
  "Offer unauthorized discounts, bonuses, refunds, or memberships.",
  "Bid on KIRA brand keywords or run paid advertising without written approval.",
  "Use spam, cookie stuffing, forced clicks, adware, impersonation, or misleading redirects.",
  "Purchase through their own link or coordinate artificial referrals.",
  "Redistribute private membership content.",
  "Register confusing domains, usernames, social profiles, or advertisements using KIRA intellectual property.",
];

const FAQ = [
  { q: "Who can apply?", a: "Relevant creators, educators, publishers, community leaders, and aligned organisations may apply. All applications are manually reviewed and approval is not guaranteed." },
  { q: "Do I need to be a KIRA member?", a: "Not necessarily. However, applicants must understand the product they intend to promote and must be able to describe it accurately." },
  { q: "How are referrals tracked?", a: "Eligible referrals are tracked through an approved link, promotional code, or attribution method. The standard attribution window is 30 days, subject to the Partner Terms." },
  { q: "When are commissions paid?", a: "Approved commissions are processed monthly after the applicable validation period and once the minimum payout threshold has been reached." },
  { q: "Do referred customers automatically receive a discount?", a: "No. A discount applies only when Kira Engineer Hub has issued an approved campaign or promotional code." },
  { q: "Can I advertise using paid search or social ads?", a: "Only after receiving written approval. Brand-keyword bidding, misleading advertisements, and unapproved use of KIRA intellectual property are prohibited." },
  { q: "Is this a broker affiliate or introducing-broker program?", a: "No. The program applies to eligible Kira Engineer Hub educational membership revenue. It does not reward broker deposits, trading volume, spreads, customer losses, or investment activity." },
  { q: "Can an application or partnership be rejected?", a: "Yes. Kira Engineer Hub may reject an application, suspend tracking, reverse ineligible commissions, or end a partnership according to the Partner Terms." },
];

const CREDIBILITY = [
  "Manually approved partners",
  "Transparent commission tracking",
  "Monthly validated payouts",
  "No trading-volume commissions",
];

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export default function PartnerNetworkPage() {
  const monthlyPrice = getStandardPrice("monthly");
  const rewardfulKey = process.env.NEXT_PUBLIC_REWARDFUL_API_KEY;

  return (
    <div className="partner-page">
      <Script id="partner-faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }} />
      {/* Rewardful loads only once its public key is configured. No tracking
          runs and no login is shown until a real partner platform exists. */}
      {rewardfulKey ? (
        <>
          <Script id="rewardful-queue" strategy="beforeInteractive">
            {`(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`}
          </Script>
          <Script src="https://r.wdfl.co/rw.js" data-rewardful={rewardfulKey} strategy="afterInteractive" />
        </>
      ) : null}

      <div className="container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Partner Network" }]} />
      </div>

      {/* Section 1: Hero */}
      <header className="partner-hero" id="overview">
        <div className="container partner-hero-grid">
          <div className="partner-hero-copy">
            <p className="eyebrow">KIRA Partner Network</p>
            <h1>Build growth around better trading education.</h1>
            <p className="partner-hero-lead">
              Introduce suitable audiences to Kira Engineer Hub and earn transparent recurring commission on eligible
              KIRA VIP Membership revenue. The KIRA Partner Network is designed for creators, educators, communities,
              publishers, and aligned businesses that value responsible promotion over financial hype.
            </p>
            <div className="partner-hero-actions">
              <PartnerCta targetId="apply" event="partner_hero_cta_click" className="button cyan">
                Apply to Become a Partner
              </PartnerCta>
              <PartnerCta targetId="how" event="partner_how_it_works_click" className="button secondary">
                Explore How It Works
              </PartnerCta>
            </div>
            <ul className="partner-credibility" aria-label="Program principles">
              {CREDIBILITY.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="partner-hero-visual" aria-hidden="true">
            <PartnerNetworkMotif />
          </div>
        </div>
      </header>

      <div className="container partner-nav-wrap">
        <PartnerSectionNav items={NAV_ITEMS} />
      </div>

      {/* Section 2: Program facts */}
      <section className="partner-section" aria-labelledby="facts-h">
        <div className="container">
          <h2 id="facts-h" className="visually-hidden">Program terms at a glance</h2>
          <div className="partner-facts">
            {FACTS.map((f) => (
              <RevealOnScroll as="div" className="partner-fact" key={f.label}>
                <span className="partner-fact-value">{f.value}</span>
                <span className="partner-fact-label">{f.label}</span>
              </RevealOnScroll>
            ))}
          </div>
          <p className="partner-fine">
            Commission eligibility remains subject to successful payment collection, validation, refund and chargeback
            rules, partner compliance, and the KIRA Partner Terms. These are program terms, not company-performance
            statistics.
          </p>
        </div>
      </section>

      {/* Section 3: Philosophy */}
      <section className="partner-section" aria-labelledby="philosophy-h">
        <div className="container">
          <div className="partner-section-head">
            <h2 id="philosophy-h">A partnership built on alignment—not aggressive promotion.</h2>
            <p>
              Kira Engineer Hub works with partners who can introduce structured trading education to relevant
              audiences honestly and responsibly. Partners are rewarded for eligible membership referrals—not customer
              deposits, trading volume, spreads, losses, or market activity.
            </p>
          </div>
          <div className="partner-grid-4">
            {PHILOSOPHY.map((c) => (
              <RevealOnScroll as="div" className="partner-card" key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Who should apply */}
      <section className="partner-section" aria-labelledby="audience-h">
        <div className="container">
          <div className="partner-section-head">
            <h2 id="audience-h">Designed for partners who value credibility.</h2>
          </div>
          <div className="partner-grid-4">
            {AUDIENCE.map((c) => (
              <RevealOnScroll as="div" className="partner-card" key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </RevealOnScroll>
            ))}
          </div>
          <div className="partner-exclude">
            <h3>Not suitable for</h3>
            <ul>
              {NOT_SUITABLE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5: How it works */}
      <section className="partner-section" id="how" aria-labelledby="how-h">
        <div className="container">
          <div className="partner-section-head">
            <h2 id="how-h">A clear path from application to partnership.</h2>
          </div>
          <ol className="partner-steps">
            {STEPS.map((s) => (
              <RevealOnScroll as="li" className="partner-step" key={s.n}>
                <span className="partner-step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </RevealOnScroll>
            ))}
          </ol>
        </div>
      </section>

      {/* Section 6: Commission model */}
      <section className="partner-section" id="commission" aria-labelledby="commission-h">
        <div className="container">
          <div className="partner-section-head">
            <h2 id="commission-h">Transparent economics. No hidden trading incentives.</h2>
            <p className="partner-commission-statement">
              Earn 20% of Net Eligible Revenue from each new qualified KIRA VIP Membership you refer, for the
              customer&apos;s first 12 successful billing cycles.
            </p>
          </div>
          <div className="partner-commission-grid">
            <dl className="partner-terms-table">
              {COMMISSION_TABLE.map((row) => (
                <div className="partner-terms-row" key={row.k}>
                  <dt>{row.k}</dt>
                  <dd>{row.v}</dd>
                </div>
              ))}
            </dl>
            <PartnerCommissionEstimate monthlyPrice={monthlyPrice} currency={pricingConfig.currency} />
          </div>
          <p className="partner-definition">
            <strong>Net Eligible Revenue</strong> means eligible membership revenue actually received by Kira Engineer
            Hub after applicable discounts, credits, refunds, chargebacks, failed payments, taxes, duplicate
            transactions, fraudulent transactions, and other excluded amounts.
          </p>
          <div className="partner-callout">
            Partner commissions apply only to eligible Kira Engineer Hub membership revenue. Kira Engineer Hub does not
            pay partner commissions based on broker deposits, trading volume, spreads, customer losses, account
            balances, investment activity, or the purchase of financial instruments.
          </div>
        </div>
      </section>

      {/* Section 7: What approved partners receive */}
      <section className="partner-section" id="tools" aria-labelledby="tools-h">
        <div className="container">
          <div className="partner-section-head">
            <h2 id="tools-h">The tools to represent KIRA properly.</h2>
          </div>
          <div className="partner-grid-3">
            {TOOLS.map((c) => (
              <RevealOnScroll as="div" className="partner-card" key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Partner standards */}
      <section className="partner-section" id="standards" aria-labelledby="standards-h">
        <div className="container">
          <div className="partner-section-head">
            <h2 id="standards-h">Trust is part of the agreement.</h2>
          </div>
          <div className="partner-standards">
            <div className="partner-standards-col partner-standards-do">
              <h3>Partners must</h3>
              <ul>
                {MUST.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="partner-standards-col partner-standards-dont">
              <h3>Partners must not</h3>
              <ul>
                {MUST_NOT.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="partner-disclosure-box">
            <h3>Required affiliate disclosure</h3>
            <p className="partner-disclosure-example">
              &ldquo;I may earn a commission if you join Kira Engineer Hub through my link or code. This does not
              increase the price you pay.&rdquo;
            </p>
            <p>
              The disclosure must be placed clearly near the recommendation, referral link, button, or call to action.
              It must not be hidden only in a biography, footer, separate terms page, or group description.
            </p>
          </div>
        </div>
      </section>

      {/* Section 9: FAQ */}
      <section className="partner-section" id="faq" aria-labelledby="faq-h">
        <div className="container partner-narrow">
          <div className="partner-section-head">
            <h2 id="faq-h">Questions, answered.</h2>
          </div>
          <PartnerFaq items={FAQ} />
        </div>
      </section>

      {/* Section 10: Application form */}
      <section className="partner-section" id="apply" aria-labelledby="apply-h" tabIndex={-1}>
        <div className="container partner-narrow">
          <div className="partner-section-head">
            <h2 id="apply-h">Apply to the KIRA Partner Network.</h2>
            <p>
              Tell us how you plan to introduce Kira Engineer Hub to your audience. Applications are reviewed manually,
              with priority given to relevance, credibility, content quality, and responsible promotion.
            </p>
          </div>
          <PartnerApplicationForm />
        </div>
      </section>

      {/* Section 11: Final CTA */}
      <section className="partner-section partner-final" aria-labelledby="final-h">
        <div className="container partner-narrow partner-final-inner">
          <h2 id="final-h">Build trust first. Growth follows.</h2>
          <p>
            Join a carefully selected network focused on responsible education, transparent referrals, and long-term
            audience value.
          </p>
          <PartnerCta targetId="apply" event="partner_final_cta_click" className="button cyan">
            Apply to Become a Partner
          </PartnerCta>
          <p>
            <Link className="text-link" href="/legal/affiliate-terms">Read the KIRA Partner Terms</Link>
          </p>
        </div>
      </section>

      {/* Section 12: Legal clarification */}
      <div className="container">
        <p className="partner-legal-note">
          Participation in the KIRA Partner Network does not create an employment relationship, agency, franchise,
          joint venture, fiduciary relationship, or legal partnership. Partners operate independently and remain
          responsible for their own content, taxes, disclosures, registrations, and legal obligations. Commission
          eligibility is governed by the{" "}
          <Link href="/legal/affiliate-terms">KIRA Partner Terms</Link>.
        </p>
      </div>
    </div>
  );
}

/**
 * Restrained connected-nodes motif for the hero - an abstract referral network,
 * not a chart or trading dashboard. Static SVG using brand tokens; decorative
 * only. A single slow pulse runs only where motion is allowed (see CSS).
 */
function PartnerNetworkMotif() {
  const nodes = [
    { cx: 150, cy: 60, r: 20, hub: true },
    { cx: 60, cy: 40, r: 8 },
    { cx: 250, cy: 44, r: 9 },
    { cx: 40, cy: 140, r: 7 },
    { cx: 120, cy: 175, r: 9 },
    { cx: 235, cy: 160, r: 8 },
    { cx: 275, cy: 110, r: 7 },
  ];
  const hub = nodes[0];
  return (
    <svg viewBox="0 0 300 220" role="img" aria-label="Abstract partner network of connected nodes" className="partner-motif">
      <g className="partner-motif-links">
        {nodes.slice(1).map((n, i) => (
          <line key={i} x1={hub.cx} y1={hub.cy} x2={n.cx} y2={n.cy} />
        ))}
      </g>
      <g className="partner-motif-nodes">
        {nodes.map((n, i) => (
          <circle key={i} cx={n.cx} cy={n.cy} r={n.r} className={n.hub ? "partner-motif-hub" : undefined} />
        ))}
      </g>
    </svg>
  );
}
