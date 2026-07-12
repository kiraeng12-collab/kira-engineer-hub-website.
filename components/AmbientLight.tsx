"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-reactive ambient lighting: a large, very soft teal radial glow that
 * follows the pointer across the page, giving the dark surfaces a sense of
 * lighting depth. Desktop-only (fine pointers) and disabled entirely under
 * prefers-reduced-motion - on those devices this renders nothing, so there
 * is no cost and no fallback needed. Position updates are rAF-throttled and
 * written straight to the element's CSS variables to avoid React re-renders.
 */
export function AmbientLight() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    function onPointerMove(event: PointerEvent) {
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!node) return;
        node.style.setProperty("--cursor-x", `${x}px`);
        node.style.setProperty("--cursor-y", `${y}px`);
        node.style.opacity = "1";
      });
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} className="ambient-light" aria-hidden="true" />;
}
