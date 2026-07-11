import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getAllArticles } from "@/lib/content/mdx";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "Official Kira Engineer Hub updates about membership, Early Bird pricing, platform development, Project 242, and education releases.",
  alternates: { canonical: "/updates" },
};

export default function UpdatesPage() {
  const articles = getAllArticles("updates");

  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Updates" }]} />
        <p className="eyebrow">Official Updates</p>
        <h1>Company and platform updates.</h1>
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
                <Link className="button secondary" href={`/updates/${article.slug}`}>Read Update</Link>
              </article>
            ))}
          </section>
        ) : (
          <div className="notice">No updates have been published yet. Check back soon.</div>
        )}
      </div>
    </div>
  );
}
