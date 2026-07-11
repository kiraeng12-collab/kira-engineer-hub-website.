export type ContentCategory = "insights" | "weekly-analysis" | "updates";

export interface ArticleFrontmatter {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  draft?: boolean;
}

export interface ArticleSummary extends ArticleFrontmatter {
  slug: string;
  category: ContentCategory;
}
