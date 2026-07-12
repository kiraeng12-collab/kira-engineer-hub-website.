"use client";

import { useState } from "react";
import Link from "next/link";
import { ArticleCover } from "./ArticleCover";
import type { ArticleSummary, ContentCategory } from "@/lib/content/types";

/**
 * Interactive editorial hub: category filter chips, one large featured
 * article (the newest in the current filter), and a cover-art grid for the
 * rest. Renders only real published articles passed in from the server -
 * empty categories get a graceful coming-soon panel instead of fabricated
 * content. Filtering is client-side over the server-rendered list, so the
 * full list is in the HTML for SEO and no-JS readers.
 */
const FILTERS: { id: ContentCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "insights", label: "Insights" },
  { id: "weekly-analysis", label: "Weekly Analysis" },
  { id: "updates", label: "Company Updates" },
];

const CATEGORY_LABELS: Record<ContentCategory, string> = {
  insights: "Insights",
  "weekly-analysis": "Weekly Analysis",
  updates: "Company Update",
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function InsightsShowcase({ articles }: { articles: ArticleSummary[] }) {
  const [filter, setFilter] = useState<ContentCategory | "all">("all");

  const visible = filter === "all" ? articles : articles.filter((a) => a.category === filter);
  const [featured, ...rest] = visible;

  return (
    <div className="insights-hub">
      <div className="insights-filters" role="group" aria-label="Filter articles by category">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            className={`filter-chip${filter === f.id ? " active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {featured ? (
        <>
          <Link className="featured-article" href={`/${featured.category}/${featured.slug}`}>
            <div className="featured-article-cover">
              <ArticleCover category={featured.category} slug={featured.slug} />
            </div>
            <div className="featured-article-body">
              <p className="article-meta">
                <span className="tag">{CATEGORY_LABELS[featured.category]}</span>
                <span>{formatDate(featured.date)}</span>
              </p>
              <h2>{featured.title}</h2>
              <p className="featured-article-description">{featured.description}</p>
              <span className="text-link">Read article</span>
            </div>
          </Link>

          {rest.length > 0 ? (
            <div className="article-grid">
              {rest.map((article) => (
                <Link
                  className="article-card"
                  key={`${article.category}-${article.slug}`}
                  href={`/${article.category}/${article.slug}`}
                >
                  <div className="article-card-cover">
                    <ArticleCover category={article.category} slug={article.slug} />
                  </div>
                  <div className="article-card-body">
                    <p className="article-meta">
                      <span className="tag">{CATEGORY_LABELS[article.category]}</span>
                      <span>{formatDate(article.date)}</span>
                    </p>
                    <h3>{article.title}</h3>
                    <p>{article.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div className="notice">
          No {filter === "all" ? "" : `${FILTERS.find((f) => f.id === filter)?.label} `}articles have been published
          yet. New material is announced through the free community first.
        </div>
      )}
    </div>
  );
}
