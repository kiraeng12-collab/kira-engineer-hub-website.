import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getAllArticles } from "@/lib/content/mdx";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Educational insights from Kira Engineer Hub covering trading education, risk discipline, market structure, and technology updates.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  const articles = getAllArticles("insights");

  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Insights" }]} />
        <p className="eyebrow">Insights</p>
        <h1>Educational notes and platform updates.</h1>
        <p className="meta">A public archive for trading education, risk discipline, and Kira Engineer Hub development notes.</p>
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
                <Link className="button secondary" href={`/insights/${article.slug}`}>Read Article</Link>
              </article>
            ))}
          </section>
        ) : (
          <div className="notice">No Insights articles have been published yet. Check back soon.</div>
        )}
      </div>
    </div>
  );
}
