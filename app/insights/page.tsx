import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { InsightsShowcase } from "@/components/insights/InsightsShowcase";
import { getAllArticles } from "@/lib/content/mdx";
import type { ArticleSummary } from "@/lib/content/types";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Educational insights from Kira Engineer Hub covering trading education, risk discipline, market structure, weekly analysis, and company updates.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  const articles: ArticleSummary[] = [
    ...getAllArticles("insights"),
    ...getAllArticles("weekly-analysis"),
    ...getAllArticles("updates"),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="section">
      <div className="container">
        <div className="hub-head">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Insights" }]} />
          <p className="eyebrow">KIRA Insights</p>
          <h1>Educational notes and platform updates.</h1>
          <p className="lead">
            A public editorial archive across trading education, weekly analysis, and Kira Engineer Hub development
            notes - published with clear dates and categories.
          </p>
        </div>
        <InsightsShowcase articles={articles} />
        <div className="pricing-actions">
          <Link className="text-link" href="/weekly-analysis">Weekly analysis archive</Link>
          <Link className="text-link" href="/updates">Company updates archive</Link>
        </div>
      </div>
    </div>
  );
}
