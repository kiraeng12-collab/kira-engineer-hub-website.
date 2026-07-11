import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getArticleBySlug, getArticleSlugs } from "@/lib/content/mdx";

export function generateStaticParams() {
  return getArticleSlugs("updates").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug("updates", slug);
  if (!article) return {};

  return {
    title: article.frontmatter.title,
    description: article.frontmatter.description,
    alternates: { canonical: `/updates/${slug}` },
  };
}

export default async function UpdateArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug("updates", slug);
  if (!article || article.frontmatter.draft) notFound();

  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Updates", href: "/updates" }, { label: article.frontmatter.title }]} />
        <p className="eyebrow">Official Updates</p>
        <h1>{article.frontmatter.title}</h1>
        <p className="meta">
          {new Date(article.frontmatter.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
      <div className="doc-body">
        <MDXRemote source={article.content} />
      </div>
    </div>
  );
}
