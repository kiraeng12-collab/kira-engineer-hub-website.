# Kira Engineer Hub Phase 9: Content Publishing System

This phase adds a real publishing system behind the three content sections
that were static placeholder pages: Insights, Weekly Analysis, and Updates.
Articles are MDX files committed to the repository - there is no database
table, no admin UI, and no new environment variables. Publishing an article
means adding a file and deploying, the same way every other page on this
site ships.

## How to publish an article

1. Add a new `.mdx` file under `content/<category>/`, where `<category>` is
   one of `insights`, `weekly-analysis`, or `updates`.
2. Give it frontmatter:

   ```yaml
   ---
   title: "Article title"
   description: "One or two sentences - used as the page's meta description."
   date: "2026-07-01"
   tags: ["optional", "tags"]
   ---
   ```

3. Write the body in Markdown/MDX below the frontmatter. Deploy.

The file's name (without `.mdx`) becomes the URL slug:
`content/insights/risk-before-strategy.mdx` becomes `/insights/risk-before-strategy`.

## Draft articles

Add `draft: true` to an article's frontmatter to keep working on it without
publishing: it's excluded from the category's listing page, its sitemap
entry, and its own detail page 404s. Remove the flag (or delete it) when
it's ready to go live.

## What's included

- `lib/content/mdx.ts`: reads frontmatter and body from `content/<category>/*.mdx`
  via `gray-matter`. `getAllArticles(category)` returns published articles
  sorted newest-first (the sorting/draft-filtering logic is a pure function,
  `sortAndFilterArticles`, unit tested in `lib/content/mdx.test.ts`).
- Listing pages (`/insights`, `/weekly-analysis`, `/updates`) list real
  published articles as cards, falling back to the original "nothing
  published yet" copy when a category is empty.
- Detail pages (`/insights/[slug]`, `/weekly-analysis/[slug]`,
  `/updates/[slug]`) render the full article via `next-mdx-remote/rsc`'s
  `<MDXRemote>` (a React Server Component - no client-side MDX bundle), with
  per-article `title`/`description`/canonical metadata and
  `generateStaticParams` for static generation at build time.
- Weekly Analysis articles always render the standard "Educational context
  only" risk disclaimer after the article body, regardless of whether the
  author included it in the MDX source - this is a standing compliance
  requirement, not something left to per-article discipline. Don't include
  the disclaimer again inside a Weekly Analysis article's own MDX body - the
  page template already appends it once, and doing both duplicates it.
- `app/sitemap.ts` includes every published article's URL automatically,
  dated by its frontmatter `date`.
- One example article was added per category (`content/insights/risk-before-strategy.mdx`,
  `content/weekly-analysis/how-to-read-a-weekly-analysis-report.mdx`,
  `content/updates/membership-launch-and-early-bird.mdx`) to establish the
  format. The Weekly Analysis example is explicitly a guide to the report
  *format* rather than a real market report - no specific instrument, date,
  or price level is referenced, since inventing one here would look like
  real analysis. The Updates example restates figures and dates already
  established elsewhere in this codebase (`lib/config/pricing.ts`,
  `lib/config/site.ts`), not new claims.

## What this phase does not include

- No authoring UI - articles are written as files, same as everywhere else
  in this repo.
- No comments, reactions, or per-article analytics.
- No RSS feed yet - a reasonable fast-follow if useful once there's a
  regular publishing cadence.
- No content-search - the listing pages are simple newest-first archives,
  which is enough at the current (and near-term expected) volume.

## Known limitation

Static generation (`generateStaticParams`) means new articles need a deploy
to appear - there is no on-demand/incremental revalidation configured yet.
Given articles ship as committed files anyway, this matches how they'd be
published either way.
