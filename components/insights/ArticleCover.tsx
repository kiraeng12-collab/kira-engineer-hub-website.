import type { ContentCategory } from "@/lib/content/types";

/**
 * Deterministic brand-based cover art for articles - abstract KIRA geometry
 * in the site's own design language instead of stock imagery. Each category
 * has its own motif (market-structure grid / scenario paths / update
 * timeline) and the slug seeds small position shifts so two articles in the
 * same category still get visually distinct covers. Pure decoration
 * (aria-hidden); never market data.
 */
function seedFrom(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) % 997;
  return hash;
}

export function ArticleCover({ category, slug }: { category: ContentCategory; slug: string }) {
  const seed = seedFrom(slug);
  const dx = (seed % 40) - 20; // -20..19
  const dy = (seed % 24) - 12; // -12..11

  return (
    <svg className="article-cover-art" viewBox="0 0 360 200" aria-hidden="true" role="presentation">
      <rect width="360" height="200" fill="var(--surface-2)" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={`v${i}`} x1={20 + i * 46} y1="0" x2={20 + i * 46} y2="200" stroke="var(--grid-line)" strokeWidth="1" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={`h${i}`} x1="0" y1={25 + i * 50} x2="360" y2={25 + i * 50} stroke="var(--grid-line)" strokeWidth="1" />
      ))}

      {category === "insights" ? (
        <g className="article-cover-motif">
          <circle cx={150 + dx} cy={86 + dy} r="34" fill="none" stroke="var(--cyan)" strokeWidth="2" />
          <circle cx={150 + dx} cy={86 + dy} r="7" fill="var(--aqua)" />
          <circle cx={236 + dx} cy={128 + dy} r="18" fill="none" stroke="var(--node-line)" strokeWidth="1.6" strokeDasharray="4 6" />
          <line x1={150 + dx} y1={86 + dy} x2={236 + dx} y2={128 + dy} stroke="var(--node-line-active)" strokeWidth="1.6" />
          <rect x={84 + dx} y={140 + dy / 2} width="60" height="22" rx="4" fill="none" stroke="var(--gold)" strokeWidth="1.4" />
        </g>
      ) : null}

      {category === "weekly-analysis" ? (
        <g className="article-cover-motif">
          <circle cx={70 + dx / 2} cy={100 + dy} r="7" fill="var(--ink)" />
          <path d={`M78 ${95 + dy} L ${210 + dx} ${44 + dy}`} stroke="var(--success)" strokeWidth="2.2" fill="none" />
          <path d={`M78 ${105 + dy} L ${210 + dx} ${156 + dy}`} stroke="var(--danger)" strokeWidth="2.2" fill="none" />
          <circle cx={216 + dx} cy={42 + dy} r="6" fill="var(--success)" />
          <circle cx={216 + dx} cy={158 + dy} r="6" fill="var(--danger)" />
          <line x1={60} y1={100 + dy} x2={320} y2={100 + dy} stroke="var(--muted)" strokeWidth="1" strokeDasharray="2 7" opacity=".7" />
        </g>
      ) : null}

      {category === "updates" ? (
        <g className="article-cover-motif">
          <line x1="50" y1={100 + dy} x2="310" y2={100 + dy} stroke="var(--node-line)" strokeWidth="1.6" />
          <circle cx={92 + dx / 2} cy={100 + dy} r="8" fill="var(--cyan)" />
          <circle cx={180 + dx / 2} cy={100 + dy} r="8" fill="var(--aqua)" />
          <circle cx={266 + dx / 2} cy={100 + dy} r="8" fill="none" stroke="var(--gold)" strokeWidth="2" />
          <rect x={152 + dx / 2} y={48 + dy} width="56" height="24" rx="4" fill="none" stroke="var(--cyan)" strokeWidth="1.4" />
          <line x1={180 + dx / 2} y1={72 + dy} x2={180 + dx / 2} y2={92 + dy} stroke="var(--node-line-active)" strokeWidth="1.4" />
        </g>
      ) : null}

      <rect width="360" height="200" fill="url(#coverFade)" opacity=".55" />
      <defs>
        <linearGradient id="coverFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="transparent" />
          <stop offset="1" stopColor="#080d13" />
        </linearGradient>
      </defs>
    </svg>
  );
}
