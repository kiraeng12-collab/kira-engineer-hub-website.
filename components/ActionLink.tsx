import Link from "next/link";
import { TelegramLink } from "@/components/TelegramLink";

/**
 * CTA link that may point at an internal route OR an external URL. Internal
 * hrefs use next/link for client navigation. Telegram (t.me) URLs go through
 * TelegramLink, which tries the Telegram app first (bypassing t.me DNS
 * blocks) and falls back to the web link. Other external URLs render a plain
 * new-tab anchor.
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
    if (href.includes("//t.me/")) {
      return (
        <TelegramLink href={href} className={className}>
          {children}
        </TelegramLink>
      );
    }
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
