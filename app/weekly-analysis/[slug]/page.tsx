import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getArticleBySlug, getArticleSlugs } from "@/lib/content/mdx";

export function generateStaticParams() {
  return getArticleSlugs("weekly-analysis").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug("weekly-analysis", slug);
  if (!article) return {};

  return {
    title: article.frontmatter.title,
    description: article.frontmatter.description,
    alternates: { canonical: `/weekly-analysis/${slug}` },
  };
}

export default async function WeeklyAnalysisArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug("weekly-analysis", slug);
  if (!article || article.frontmatter.draft) notFound();

  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Weekly Analysis", href: "/weekly-analysis" },
            { label: article.frontmatter.title },
          ]}
        />
        <p className="eyebrow">Weekly Analysis</p>
        <h1>{article.frontmatter.title}</h1>
        <p className="meta">
          {new Date(article.frontmatter.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
      <div className="doc-body">
        <MDXRemote source={article.content} />
        <div className="risk-warning">
          <strong>Educational context only</strong>
          Weekly analysis is not a signal service, personal recommendation, or guarantee of market outcome.
        </div>
      </div>
    </div>
  );
}
