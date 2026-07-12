"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shared scroll-reveal wrapper: adds the `.reveal` class only after mount
 * (so content stays fully visible with no JS / before hydration - no
 * flash-of-invisible-content), then flips to `.is-visible` the first time
 * the element enters the viewport. Reveals once and stops observing -
 * this is a one-time entrance, not a repeating scroll effect.
 */
type RevealTag = "div" | "section" | "article" | "li" | "span";

export function RevealOnScroll({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: RevealTag;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setReady(true);
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const classes = [className, ready ? "reveal" : "", visible ? "is-visible" : ""].filter(Boolean).join(" ");

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={classes || undefined}>
      {children}
    </Tag>
  );
}
