import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ArticleFrontmatter, ArticleSummary, ContentCategory } from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content");

/** Only published articles, newest first - kept pure/fs-free so it's directly unit testable. */
export function sortAndFilterArticles(articles: ArticleSummary[]): ArticleSummary[] {
  return articles
    .filter((article) => !article.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function categoryDir(category: ContentCategory): string {
  return path.join(CONTENT_ROOT, category);
}

export function getArticleSlugs(category: ContentCategory): string[] {
  const dir = categoryDir(category);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getArticleBySlug(
  category: ContentCategory,
  slug: string
): { frontmatter: ArticleFrontmatter; content: string } | null {
  const filePath = path.join(categoryDir(category), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { frontmatter: data as ArticleFrontmatter, content };
}

/** All published articles in a category, newest first. */
export function getAllArticles(category: ContentCategory): ArticleSummary[] {
  const summaries = getArticleSlugs(category).map((slug) => {
    const article = getArticleBySlug(category, slug);
    return { ...(article?.frontmatter as ArticleFrontmatter), slug, category };
  });
  return sortAndFilterArticles(summaries);
}
