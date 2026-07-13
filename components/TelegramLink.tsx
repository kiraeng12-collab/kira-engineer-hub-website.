import type { ReactNode } from "react";

/**
 * A plain link to Telegram. Kept as the single place Telegram-link behavior
 * is defined. It is intentionally a bare same-tab anchor with no target and
 * no JS: on mobile, tapping a t.me link is handed off to the installed
 * Telegram app by the OS (universal/app links), which is the most reliable
 * way to open the channel in the app rather than the Telegram web page.
 */
export function TelegramLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}
