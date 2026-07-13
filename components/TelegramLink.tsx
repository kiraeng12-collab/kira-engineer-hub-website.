"use client";

import type { MouseEvent, ReactNode } from "react";

/**
 * Smart Telegram link. Renders a normal anchor to the t.me web URL (works
 * with no JS, is crawlable, and is the correct fallback), but on click it
 * first tries the Telegram app's own URL scheme (tg://). The app scheme is
 * handled by the installed Telegram app directly and never resolves the
 * t.me domain in the browser, so it bypasses ISP/DNS blocks of t.me that
 * are common in some regions. If no app is installed, the tg:// attempt
 * does nothing and we fall back to the t.me web URL after a short delay.
 */
function toDeepLink(webUrl: string): string | null {
  try {
    const url = new URL(webUrl);
    if (url.hostname !== "t.me") return null;
    const path = url.pathname.replace(/^\/+/, "");
    if (!path) return null;
    // Private invite links: t.me/+HASH or t.me/joinchat/HASH -> tg://join?invite=HASH
    if (path.startsWith("+")) return `tg://join?invite=${encodeURIComponent(path.slice(1))}`;
    if (path.startsWith("joinchat/")) return `tg://join?invite=${encodeURIComponent(path.slice("joinchat/".length))}`;
    // Public username: t.me/USERNAME -> tg://resolve?domain=USERNAME
    return `tg://resolve?domain=${encodeURIComponent(path.split("/")[0])}`;
  } catch {
    return null;
  }
}

export function TelegramLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const deepLink = toDeepLink(href);

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    // Respect modified clicks (open-in-new-tab, etc.) and missing deep link.
    if (!deepLink || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();

    let fellBack = false;
    const goWeb = () => {
      if (fellBack) return;
      fellBack = true;
      window.location.href = href;
    };

    // If the app opens, the tab is backgrounded before this fires -> skip web.
    const timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") goWeb();
    }, 1200);

    const onHide = () => {
      if (document.visibilityState === "hidden") window.clearTimeout(timer);
    };
    document.addEventListener("visibilitychange", onHide, { once: true });

    // Attempt to hand off to the Telegram app.
    window.location.href = deepLink;
  }

  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
      {children}
    </a>
  );
}
