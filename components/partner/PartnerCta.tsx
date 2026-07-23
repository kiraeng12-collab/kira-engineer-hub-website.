"use client";

import { trackEvent } from "@/lib/analytics";

/**
 * Anchor-style button that smooth-scrolls to an in-page target and reports a
 * coarse analytics event. Honours prefers-reduced-motion by falling back to an
 * instant jump. Renders a real <a href> so it works without JS and is keyboard
 * and screen-reader friendly.
 */
export function PartnerCta({
  targetId,
  event,
  className,
  children,
}: {
  targetId: string;
  event: string;
  className: string;
  children: React.ReactNode;
}) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    trackEvent(event);
    const target = document.getElementById(targetId);
    if (!target) return; // let the browser handle the hash normally
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    // Move focus for keyboard users without a second visible jump.
    target.setAttribute("tabindex", "-1");
    (target as HTMLElement).focus({ preventScroll: true });
  }

  return (
    <a href={`#${targetId}`} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
