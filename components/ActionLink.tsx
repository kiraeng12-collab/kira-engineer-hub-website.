import Link from "next/link";

/**
 * CTA link that may point at an internal route OR an external URL (e.g. a
 * Telegram join link). Internal hrefs use next/link for client navigation;
 * external hrefs (http/https) render a plain anchor that opens in a new tab
 * with safe rel attributes, so the site stays open and mobile hands off to
 * the Telegram app reliably.
 */
export function ActionLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}
