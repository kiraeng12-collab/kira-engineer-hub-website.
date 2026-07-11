import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { siteConfig } from "@/lib/config/site";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ProductLogo } from "@/components/ProductLogo";
import { EarlyBirdBadge } from "@/components/EarlyBirdBadge";
import { comparisonColumns, comparisonRows } from "@/lib/config/comparison";
import { getStandardPrice, getQuarterlySaving, getQuarterlyEffectiveMonthly } from "@/lib/config/pricing";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "Kira Engineer Hub | Trading Education, Risk Discipline and Technology",
    description:
      "Structured trading education, risk-first market analysis, community access, and financial technology in one connected ecosystem.",
    url: "/",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Kira Engineer Hub",
  url: "https://www.kiraengineerhub.com/",
  description: "Structured trading education, risk discipline, community access, and financial technology.",
  sameAs: [
    siteConfig.social.telegramCommunity,
    siteConfig.social.instagramFounder,
    siteConfig.social.instagramTrading,
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Kira Engineer Hub financial advice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Kira Engineer Hub provides education and general market information. It does not provide personalized financial, investment, tax, or legal advice.",
      },
    },
    {
      "@type": "Question",
      name: "How is membership access delivered?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Access is currently coordinated through Telegram while online checkout is being prepared.",
      },
    },
  ],
};

const previewComparisonRows = comparisonRows.filter((row) =>
  [
    "Public educational updates",
    "Private educational analysis",
    "Structured course material",
    "Risk-management framework",
    "Recurring membership",
  ].includes(row.label)
);

export default function HomePage() {
  const quarterlySaving = getQuarterlySaving();
  return (
    <>
      <Script
        id="ld-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Script
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="hero" id="home">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Trading Education &bull; Risk Discipline &bull; Financial Technology</p>
            <h1>
              Trade with structure.
              <br />
              Learn with discipline.
              <br />
              Build with technology.
            </h1>
            <p className="lead">
              Kira Engineer Hub connects structured market education, risk-aware trading frameworks, community
              experience and practical technology in one evolving ecosystem.
            </p>
            <div className="actions">
              <a className="button cyan" href={siteConfig.social.telegramCommunity}>Join the Free Community</a>
              <Link className="button secondary" href="/membership">Explore KIRA VIP</Link>
              <Link className="text-link" href="/ecosystem">Discover the Ecosystem</Link>
            </div>
            <div className="trust-row" aria-label="Kira Engineer Hub credibility points">
              <div className="trust-item">
                <strong>Community since 2021</strong>
                <span>Built from real market discussion and education.</span>
              </div>
              <div className="trust-item">
                <strong>Risk-first education</strong>
                <span>Capital protection before prediction.</span>
              </div>
              <div className="trust-item">
                <strong>Scenario-based analysis</strong>
                <span>Scenarios, levels, invalidation, review.</span>
              </div>
              <div className="trust-item">
                <strong>Technology under development</strong>
                <span>Education now, technology as it becomes ready.</span>
              </div>
            </div>
          </div>
          <div className="market-visual" aria-label="Kira ecosystem: five connected products around one structured hub">
            <div className="visual-inner">
              <div className="visual-top">
                <div>
                  <strong>Kira Ecosystem</strong>
                  <span>One structured system, five connected products</span>
                </div>
                <span className="status-badge"><span className="status-dot" /> Actively developed</span>
              </div>
              <div className="framework-chart ecosystem-diagram" aria-hidden="true">
                <svg viewBox="0 0 520 330" preserveAspectRatio="xMidYMid meet">
                  <circle className="orbit-ring" cx="260" cy="165" r="125" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 6" />

                  <line x1="260" y1="165" x2="260" y2="40" stroke="var(--cyan)" strokeWidth="1.5" opacity=".6" />
                  <line x1="260" y1="165" x2="379" y2="126" stroke="var(--aqua)" strokeWidth="1.5" opacity=".55" />
                  <line x1="260" y1="165" x2="333" y2="266" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="4 4" opacity=".45" />
                  <line x1="260" y1="165" x2="186" y2="266" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="3 5" opacity=".4" />
                  <line x1="260" y1="165" x2="141" y2="126" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="2 6" opacity=".4" />

                  <circle className="hub-glow" cx="260" cy="165" r="40" fill="var(--cyan)" opacity=".1" />
                  <circle cx="260" cy="165" r="26" fill="var(--surface-2)" stroke="var(--cyan)" strokeWidth="1.5" />
                  <svg x="238" y="143" width="44" height="44" viewBox="0 0 100 100">
                    <use href="#ke-market-mark" />
                  </svg>

                  <circle cx="260" cy="40" r="9" fill="var(--cyan)" />
                  <text x="260" y="22" textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="700">Community</text>

                  <circle cx="379" cy="126" r="9" fill="var(--aqua)" />
                  <text x="394" y="121" textAnchor="start" fill="var(--ink)" fontSize="13" fontWeight="700">VIP</text>
                  <text x="394" y="136" textAnchor="start" fill="var(--muted)" fontSize="10">Membership</text>

                  <circle cx="333" cy="266" r="9" fill="var(--surface)" stroke="var(--gold)" strokeWidth="2" />
                  <text x="333" y="290" textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="700">Academy</text>

                  <circle cx="186" cy="266" r="9" fill="var(--surface)" stroke="var(--muted)" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="186" y="290" textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="700">Project 242</text>

                  <circle cx="141" cy="126" r="9" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="2 4" />
                  <text x="126" y="121" textAnchor="end" fill="var(--ink)" fontSize="13" fontWeight="700">Technology</text>
                  <text x="126" y="136" textAnchor="end" fill="var(--muted)" fontSize="10">Roadmap</text>
                </svg>
              </div>
              <div className="visual-legend">
                <div className="legend-chip"><span>Kira Trading Community</span><strong>Live</strong></div>
                <div className="legend-chip"><span>KIRA VIP Membership</span><strong>Preparing checkout</strong></div>
                <div className="legend-chip"><span>Project 242</span><strong>In development</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="ecosystem">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Product ecosystem</p>
              <h2>One connected trading-education ecosystem.</h2>
            </div>
            <p className="lead">
              Start with the public community, progress through structured membership, and follow future education
              and technology releases as they become ready.
            </p>
          </div>
          <div className="ecosystem-grid">
            <article className="card product-card">
              <div className="product-top">
                <ProductLogo product="community" />
                <div><span className="tag" data-tone="live">Live</span><h3>Kira Trading Community</h3></div>
              </div>
              <p>A free Telegram community for public education, market updates, announcements, and community discussion.</p>
              <a className="button secondary" href={siteConfig.social.telegramCommunity}>Join Free Community</a>
            </article>
            <article className="card product-card">
              <div className="product-top">
                <ProductLogo product="vip" />
                <div><span className="tag" data-tone="live">Membership</span><h3>KIRA VIP Membership</h3></div>
              </div>
              <p>A private educational membership for structured market discussion, risk-aware planning, learning resources, community support, and regular market updates.</p>
              <Link className="button secondary" href="/membership">View Membership</Link>
            </article>
            <article className="card product-card">
              <div className="product-top">
                <svg className="product-symbol" viewBox="0 0 100 100" aria-hidden="true"><use href="#project-242-loop" /></svg>
                <div><span className="tag" data-tone="soon">In development</span><h3>Project 242</h3></div>
              </div>
              <p>In development. Public details remain intentionally limited until the initiative is ready.</p>
              <Link className="button secondary" href="/project-242">Follow Development</Link>
            </article>
          </div>
          <div className="pricing-actions">
            <Link className="text-link" href="/ecosystem">See the full ecosystem</Link>
          </div>
        </div>
      </section>

      <section className="section dark-section" id="method">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">KIRA method</p>
              <h2>One structured decision process.</h2>
            </div>
            <p className="lead">
              Four steps, applied consistently: understand context, define scenarios, control exposure, and review
              decisions. Structured process over prediction.
            </p>
          </div>
          <ol className="method-steps">
            <li className="method-step">
              <span className="step-node" aria-hidden="true">01</span>
              <h3>Understand Context</h3>
              <p>Read market structure, key levels, and the conditions currently in play before forming a view.</p>
            </li>
            <li className="method-step">
              <span className="step-node" aria-hidden="true">02</span>
              <h3>Define Scenarios</h3>
              <p>Set bullish and bearish scenarios with clear invalidation, instead of predicting a single outcome.</p>
            </li>
            <li className="method-step">
              <span className="step-node" aria-hidden="true">03</span>
              <h3>Control Exposure</h3>
              <p>Size risk and plan the trade before entry, so no single decision can outweigh the process.</p>
            </li>
            <li className="method-step">
              <span className="step-node" aria-hidden="true">04</span>
              <h3>Review Decisions</h3>
              <p>Review what happened against the plan, not just the outcome, and feed it back into the next cycle.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section" id="compare">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Free vs VIP</p>
              <h2>Compare the free community and KIRA VIP Membership.</h2>
            </div>
            <p className="lead">A quick look at what separates public access from private membership.</p>
          </div>
          <ComparisonTable
            columns={comparisonColumns}
            rows={previewComparisonRows}
            caption="Feature comparison preview across Kira Trading Community, KIRA VIP Membership, KIRA Academy, and Project 242"
          />
          <div className="pricing-actions">
            <Link className="text-link" href="/membership/compare">See the full comparison</Link>
          </div>
        </div>
      </section>

      <section className="section dark-section" id="membership">
        <div className="container membership-layout">
          <div>
            <p className="eyebrow">KIRA VIP Membership</p>
            <h2>KIRA VIP Membership.</h2>
            <p className="lead">
              Structured educational discussion, risk-aware planning, market updates, resources, and community
              support delivered through private access.
            </p>
            <div className="notice">
              <strong>Online checkout is being prepared.</strong>
              <br />
              Until checkout is live, membership requests are handled directly through Telegram.
            </div>
            <p className="small-disclosure">
              Educational membership only. It does not provide personalized financial advice, investment management,
              broker services, or guaranteed results.
            </p>
          </div>
          <div>
            <div className="pricing-grid" aria-label="KIRA VIP Membership pricing">
              <article className="price-card">
                <span className="tag">Most Flexible</span>
                <h3>KIRA VIP Monthly</h3>
                <div className="price">USD {getStandardPrice("monthly")} <span>per month</span></div>
              </article>
              <article className="price-card featured">
                <span className="tag">BEST VALUE</span>
                <h3>KIRA VIP Quarterly</h3>
                <div className="price">USD {getStandardPrice("quarterly")} <span>every three months</span></div>
                <ul className="check-list">
                  <li>Saving: USD {quarterlySaving.amount}, equal to {quarterlySaving.percentage}%</li>
                  <li>Equivalent cost: USD {getQuarterlyEffectiveMonthly()} per month</li>
                </ul>
              </article>
            </div>
            <div className="notice">
              <EarlyBirdBadge label="Early Bird Lifetime Discount Eligibility" /> Verified eligible members receive
              20% off qualifying KIRA VIP Membership prices while the qualifying service remains available.
            </div>
            <div className="pricing-actions">
              <Link className="button cyan" href="/membership">View Full Membership Details</Link>
              <Link className="text-link" href="/early-bird">Check Early Bird eligibility</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="project-242">
        <div className="container project-band">
          <svg className="project-mark-large" viewBox="0 0 100 100" aria-label="Project 242 logo"><use href="#project-242-loop" /></svg>
          <div>
            <p className="eyebrow">In development</p>
            <h2>A private Kira Engineer initiative.</h2>
            <p className="lead">
              Project 242 is a proprietary risk-management initiative being developed to help traders apply
              structured decision controls before, during and after a trade.
            </p>
            <p className="muted">Built to protect traders from the decisions they make under pressure. Its methodology is not public.</p>
            <div className="pricing-actions">
              <Link className="button ghost" href="/project-242">Follow the Development</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section dark-section" id="insights">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Latest insights</p>
              <h2>Official notes from Kira Engineer Hub.</h2>
            </div>
            <p className="lead">Educational notes and launch updates are published with clear dates, categories, and status labels.</p>
          </div>
          <div className="why-grid">
            <article className="card">
              <span className="tag" data-tone="soon">1 August 2026</span>
              <h3>Membership and payment experience launch</h3>
              <p>
                A new KIRA membership and payment experience is scheduled for 1 August 2026, with loyalty pricing
                preserved for verified eligible members.
              </p>
              <Link className="text-link" href="/early-bird">View Early Bird eligibility</Link>
            </article>
            <article className="card">
              <span className="tag" data-tone="live">4 July 2026</span>
              <h3>KIRA VIP Membership pricing updated</h3>
              <p>KIRA VIP Membership is presented with explicit USD pricing, renewal context, and Early Bird eligibility language.</p>
              <Link className="text-link" href="/membership">View membership</Link>
            </article>
            <article className="card">
              <span className="tag" data-tone="soon">In development</span>
              <h3>Project 242 remains private</h3>
              <p>Project 242 will receive additional public details only when its product, protection, and delivery framework are ready.</p>
              <Link className="text-link" href="/project-242">Project 242</Link>
            </article>
          </div>
          <div className="pricing-actions">
            <Link className="text-link" href="/insights">Read all insights</Link>
            <Link className="text-link" href="/updates">Company updates</Link>
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="container story">
          <div>
            <p className="eyebrow">About</p>
            <h2>Built from real community experience since 2021.</h2>
            <p className="lead">
              Kira Engineer Hub grew from years of market discussion, education, community management, and the
              practical challenges traders face when applying discipline under pressure.
            </p>
            <p className="muted">
              The brand applies structured thinking to trading education, risk discipline, community, and financial
              technology. Its roadmap is deliberately transparent: education and community first, technology
              products as they become ready.
            </p>
          </div>
          <div className="story-panel">
            <ul className="timeline">
              <li><strong>2021</strong><span>Community foundation and public market discussion.</span></li>
              <li><strong>Now</strong><span>Free community and private educational membership.</span></li>
              <li><strong>Next</strong><span>Project 242 development and payment checkout preparation.</span></li>
              <li><strong>Future</strong><span>Trading technology tools subject to readiness and review.</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section compact" id="faq">
        <div className="container faq-grid">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2>Common questions.</h2>
            <p className="lead">Short answers for visitors, members, and payment providers reviewing the site.</p>
          </div>
          <div>
            <details>
              <summary>Is Kira Engineer Hub financial advice?</summary>
              <p>No. Kira Engineer Hub provides education and general information. Nothing on the website, Telegram channels, or membership areas is personalized financial, investment, tax, legal, or professional advice.</p>
            </details>
            <details>
              <summary>Does membership guarantee trading results?</summary>
              <p>No. Trading involves risk, and results depend on the trader&apos;s decisions, risk exposure, market conditions, and discipline. Membership is educational and does not guarantee outcomes.</p>
            </details>
            <details>
              <summary>How is access delivered?</summary>
              <p>Access is currently coordinated through Telegram while online checkout is being prepared. Confirm renewal, cancellation, and refund terms before payment.</p>
            </details>
            <details>
              <summary>What is Project 242?</summary>
              <p>Project 242 is an in-development Kira Engineer initiative. Its purpose, structure, and release details will be shared carefully when the project is ready.</p>
            </details>
            <details>
              <summary>What does Early Bird Lifetime Discount Eligibility mean?</summary>
              <p>It means lifetime eligibility for a 20% discount on qualifying KIRA VIP Membership prices while the qualifying service remains available. It does not mean lifetime VIP access, free access, or access without an active paid subscription.</p>
            </details>
            <p><Link className="text-link" href="/faq">See all frequently asked questions</Link></p>
          </div>
        </div>
      </section>

      <section className="section compact final-cta">
        <div className="container">
          <p className="eyebrow">Next step</p>
          <h2>Build a more structured trading process.</h2>
          <p className="lead">Join the free community or request KIRA VIP Membership access when you are ready for a more structured educational environment.</p>
          <div className="actions">
            <a className="button cyan" href={siteConfig.social.telegramCommunity}>Join the Free Community</a>
            <Link className="button secondary" href="/membership">Explore Membership</Link>
          </div>
        </div>
      </section>
    </>
  );
}
