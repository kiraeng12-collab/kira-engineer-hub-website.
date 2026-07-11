import { describe, it, expect } from "vitest";
import { sortAndFilterArticles } from "./mdx";
import type { ArticleSummary } from "./types";

function article(overrides: Partial<ArticleSummary>): ArticleSummary {
  return {
    title: "Untitled",
    description: "",
    date: "2026-01-01",
    slug: "untitled",
    category: "insights",
    ...overrides,
  };
}

describe("sortAndFilterArticles", () => {
  it("sorts articles newest first", () => {
    const result = sortAndFilterArticles([
      article({ slug: "oldest", date: "2026-01-01" }),
      article({ slug: "newest", date: "2026-06-01" }),
      article({ slug: "middle", date: "2026-03-01" }),
    ]);
    expect(result.map((a) => a.slug)).toEqual(["newest", "middle", "oldest"]);
  });

  it("excludes draft articles", () => {
    const result = sortAndFilterArticles([
      article({ slug: "published" }),
      article({ slug: "draft-post", draft: true }),
    ]);
    expect(result.map((a) => a.slug)).toEqual(["published"]);
  });

  it("returns an empty array when everything is a draft", () => {
    const result = sortAndFilterArticles([article({ draft: true })]);
    expect(result).toEqual([]);
  });
});
