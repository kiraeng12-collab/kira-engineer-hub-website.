import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getAllArticles } from "@/lib/content/mdx";

export const metadata: Metadata = {
  title: "Weekly Analysis Archive",
  description:
    "Weekly analysis archive for educational market context from Kira Engineer Hub. Reports are not trade recommendations or guaranteed outcomes.",
  alternates: { canonical: "/weekly-analysis" },
};

export default function WeeklyAnalysisPage() {
  const articles = getAllArticles("weekly-analysis");

  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Weekly Analysis" }]} />
        <p className="eyebrow">Archive</p>
        <h1>Weekly analysis archive.</h1>
        <p className="meta">Reports may cover XAUUSD, BTCUSD, XAGUSD, US indices, and macro outlooks when published.</p>
      </div>
      <div className="doc-body">
        {articles.length > 0 ? (
          <section className="cards">
            {articles.map((article) => (
              <article className="card" key={article.slug}>
                <span className="pill">
                  {new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                <h2>{article.title}</h2>
                <p>{article.description}</p>
                <Link className="button secondary" href={`/weekly-analysis/${article.slug}`}>Read Report</Link>
              </article>
            ))}
          </section>
        ) : (
          <div className="hero-panel">
            <h2>Report format</h2>
            <ul>
              <li>Macro overview and important events.</li>
              <li>Bullish and bearish scenarios.</li>
              <li>Important levels and risk considerations.</li>
              <li>Clear educational disclaimer.</li>
            </ul>
          </div>
        )}
        <div className="risk-warning">
          <strong>Educational context only</strong>
          Weekly analysis is not a signal service, personal recommendation, or guarantee of market outcome.
        </div>
      </div>
    </div>
  );
}
