import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { siteConfig } from "@/lib/config/site";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ProductLogo } from "@/components/ProductLogo";
import { EarlyBirdBadge } from "@/components/EarlyBirdBadge";
import { comparisonColumns, comparisonRows } from "@/lib/config/comparison";
import { getStandardPrice, getQuarterlySaving, getQuarterlyEffectiveMonthly } from "@/lib/config/pricing";
import { DecisionEngine } from "@/components/home/DecisionEngine";
import { PathSelector } from "@/components/home/PathSelector";
import { EcosystemMap } from "@/components/home/EcosystemMap";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { getAllArticles } from "@/lib/content/mdx";
import type { ContentCategory } from "@/lib/content/types";

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

const INSIGHTS_CATEGORIES: { category: ContentCategory; label: string }[] = [
  { category: "updates", label: "Company Update" },
  { category: "insights", label: "Insights" },
  { category: "weekly-analysis", label: "Weekly Analysis" },
];

type LatestArticleEntry = { category: ContentCategory; label: string; article: ReturnType<typeof getAllArticles>[number] };

export default function HomePage() {
  const quarterlySaving = getQuarterlySaving();
  const latestArticles = INSIGHTS_CATEGORIES.map(({ category, label }): LatestArticleEntry | null => {
    const [latest] = getAllArticles(category);
    return latest ? { category, label, article: latest } : null;
  }).filter((entry): entry is LatestArticleEntry => entry !== null);
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
          <div className="market-visual" aria-label="KIRA Decision Engine: an interactive walkthrough of the four-step KIRA method">
            <div className="visual-inner">
              <DecisionEngine />
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="choose-path">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Choose Your KIRA Path</p>
              <h2>Four ways to start, one connected ecosystem.</h2>
            </div>
            <p className="lead">Select the path that matches where you are today - every path stays connected to the same ecosystem.</p>
          </div>
          <PathSelector />
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
          <EcosystemMap />
          <div className="pricing-actions">
            <Link className="text-link" href="/ecosystem">See the full ecosystem</Link>
          </div>
        </div>
      </section>

      <section className="section" id="community-story">
        <div className="container story">
          <div>
            <p className="eyebrow">Kira Trading Community</p>
            <h2>Free and public since 2021.</h2>
            <p className="lead">
              Kira Trading Community is where Kira Engineer Hub started - a free public Telegram space for market
              education, general insights, and community discussion, open to anyone learning the markets.
            </p>
            <p className="muted">
              No paywall, no personalized advice, no guaranteed outcomes - just consistent educational content and a
              clear pathway toward more structured, private access when you want it.
            </p>
            <div className="actions">
              <a className="button cyan" href={siteConfig.social.telegramCommunity}>Join Free Community</a>
              <Link className="text-link" href="/community">Learn more about the community</Link>
            </div>
          </div>
          <div className="story-panel">
            <p className="eyebrow">What to expect</p>
            <ul className="check-list">
              <li>Educational market context and public updates.</li>
              <li>Community announcements from Kira Engineer Hub.</li>
              <li>General learning material without personalized financial advice.</li>
              <li>Clear pathways toward KIRA VIP Membership when private access is needed.</li>
            </ul>
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
            <RevealOnScroll as="li" className="method-step">
              <span className="step-node" aria-hidden="true">01</span>
              <h3>Understand Context</h3>
              <p>Read market structure, key levels, and the conditions currently in play before forming a view.</p>
            </RevealOnScroll>
            <RevealOnScroll as="li" className="method-step">
              <span className="step-node" aria-hidden="true">02</span>
              <h3>Define Scenarios</h3>
              <p>Set bullish and bearish scenarios with clear invalidation, instead of predicting a single outcome.</p>
            </RevealOnScroll>
            <RevealOnScroll as="li" className="method-step">
              <span className="step-node" aria-hidden="true">03</span>
              <h3>Control Exposure</h3>
              <p>Size risk and plan the trade before entry, so no single decision can outweigh the process.</p>
            </RevealOnScroll>
            <RevealOnScroll as="li" className="method-step">
              <span className="step-node" aria-hidden="true">04</span>
              <h3>Review Decisions</h3>
              <p>Review what happened against the plan, not just the outcome, and feed it back into the next cycle.</p>
            </RevealOnScroll>
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

      <section className="section" id="academy-story">
        <div className="container story">
          <div>
            <p className="eyebrow">KIRA Academy</p>
            <h2>Structured learning, released only when it&apos;s ready.</h2>
            <p className="lead">
              KIRA Academy is being built for traders who want sequenced, structured learning rather than scattered
              content - a deeper path for anyone who has read the free community content and wants more structure.
            </p>
            <p className="muted">
              Content will be published only when learning structure, delivery quality, legal boundaries, and support
              resources are ready. No course is presented as a shortcut to guaranteed trading results.
            </p>
            <div className="actions">
              <Link className="button secondary" href="/academy">Explore Academy</Link>
              <Link className="text-link" href="/updates">Follow updates</Link>
            </div>
          </div>
          <div className="story-panel">
            <p className="eyebrow">Planned learning tracks</p>
            <ul className="check-list">
              <li>Beginner Education - markets, terminology, and how to learn safely.</li>
              <li>Risk Management - position sizing and capital protection as a discipline.</li>
              <li>Market Structure - reading price behaviour and changing conditions.</li>
              <li>Trading Psychology - decision-making under pressure, not chasing outcomes.</li>
              <li>Technology Tools - future decision-support tools that support judgement.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section" id="project-242">
        <div className="container project-band">
          <div className="project-mark-frame">
            <ProductLogo product="project242" size={96} className="project-mark-large" />
          </div>
          <div>
            <p className="eyebrow">In development</p>
            <h2>A private Kira Engineer initiative.</h2>
            <p className="lead">
              Project 242 is currently in development. No public details are available at this stage.
            </p>
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
            <p className="lead">The latest from each category - educational insights, weekly analysis, and company updates.</p>
          </div>
          {latestArticles.length > 0 ? (
            <div className="why-grid">
              {latestArticles.map(({ category, label, article }) => (
                <article className="card" key={`${category}-${article.slug}`}>
                  <span className="tag">{label}</span>
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <p className="small-disclosure">
                    {new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <Link className="text-link" href={`/${category}/${article.slug}`}>Read article</Link>
                </article>
              ))}
            </div>
          ) : null}
          <div className="pricing-actions">
            <Link className="text-link" href="/insights">Read all insights</Link>
            <Link className="text-link" href="/weekly-analysis">Weekly analysis</Link>
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
              <RevealOnScroll as="li"><strong>2021</strong><span>Community foundation and public market discussion.</span></RevealOnScroll>
              <RevealOnScroll as="li"><strong>Now</strong><span>Free community and private educational membership.</span></RevealOnScroll>
              <RevealOnScroll as="li"><strong>Next</strong><span>Project 242 development and payment checkout preparation.</span></RevealOnScroll>
              <RevealOnScroll as="li"><strong>Future</strong><span>Trading technology tools subject to readiness and review.</span></RevealOnScroll>
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
