import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

type Entry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

// Only real, canonical, indexable routes - no pre-redirect legacy paths
// (those 301 elsewhere per next.config.ts and shouldn't be crawled directly)
// and nothing noindex (account/*, auth, checkout results).
const entries: Entry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/ecosystem", changeFrequency: "monthly", priority: 0.9 },
  { path: "/community", changeFrequency: "monthly", priority: 0.9 },
  { path: "/membership", changeFrequency: "monthly", priority: 0.9 },
  { path: "/membership/compare", changeFrequency: "monthly", priority: 0.8 },
  { path: "/academy", changeFrequency: "monthly", priority: 0.7 },
  { path: "/project-242", changeFrequency: "monthly", priority: 0.7 },
  { path: "/insights", changeFrequency: "weekly", priority: 0.8 },
  { path: "/weekly-analysis", changeFrequency: "weekly", priority: 0.7 },
  { path: "/updates", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/founder", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/support", changeFrequency: "monthly", priority: 0.7 },
  { path: "/shop", changeFrequency: "monthly", priority: 0.6 },
  { path: "/security", changeFrequency: "monthly", priority: 0.5 },
  { path: "/status", changeFrequency: "weekly", priority: 0.5 },
  { path: "/legal", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/partner-program", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy-request", changeFrequency: "yearly", priority: 0.3 },
  { path: "/community-rules", changeFrequency: "monthly", priority: 0.5 },
  { path: "/early-bird", changeFrequency: "monthly", priority: 0.6 },
  { path: "/legal/terms", changeFrequency: "monthly", priority: 0.5 },
  { path: "/legal/membership-terms", changeFrequency: "monthly", priority: 0.5 },
  { path: "/legal/risk-disclosure", changeFrequency: "monthly", priority: 0.5 },
  { path: "/legal/refund-policy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/legal/privacy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/legal/cookie-policy", changeFrequency: "monthly", priority: 0.4 },
  { path: "/legal/complaints", changeFrequency: "monthly", priority: 0.4 },
  { path: "/legal/affiliate-terms", changeFrequency: "monthly", priority: 0.4 },
  { path: "/legal/affiliate-disclosure", changeFrequency: "monthly", priority: 0.4 },
  { path: "/legal/regulatory-notice", changeFrequency: "monthly", priority: 0.4 },
  { path: "/legal/accessibility", changeFrequency: "monthly", priority: 0.4 },
  { path: "/legal/project-242-terms", changeFrequency: "monthly", priority: 0.4 },
  { path: "/ar/legal", changeFrequency: "monthly", priority: 0.3 },
  { path: "/ar/terms", changeFrequency: "monthly", priority: 0.2 },
  { path: "/ar/membership-terms", changeFrequency: "monthly", priority: 0.2 },
  { path: "/ar/early-bird", changeFrequency: "monthly", priority: 0.3 },
  { path: "/ar/project-242-terms", changeFrequency: "monthly", priority: 0.2 },
  { path: "/ar/risk-disclosure", changeFrequency: "monthly", priority: 0.2 },
  { path: "/ar/refund-cancellation", changeFrequency: "monthly", priority: 0.2 },
  { path: "/ar/privacy", changeFrequency: "monthly", priority: 0.2 },
  { path: "/ar/cookies", changeFrequency: "monthly", priority: 0.2 },
  { path: "/ar/complaints", changeFrequency: "monthly", priority: 0.2 },
  { path: "/ar/affiliate-disclosure", changeFrequency: "monthly", priority: 0.2 },
  { path: "/ar/community-rules", changeFrequency: "monthly", priority: 0.2 },
  { path: "/ar/regulatory-notice", changeFrequency: "monthly", priority: 0.2 },
  { path: "/ar/accessibility", changeFrequency: "monthly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return entries.map(({ path, changeFrequency, priority }) => ({
    url: `${siteConfig.websiteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
