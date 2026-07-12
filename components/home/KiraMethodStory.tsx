"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-driven story for the four KIRA Method stages. Desktop: a sticky
 * visual panel advances (crossfades) as the visitor scrolls the step text
 * on the right. Mobile: the same visuals render inline above each step in
 * a plain vertical flow - no sticky behaviour. The stage copy is the same
 * approved method text used since Phase 3; visuals are abstract geometry
 * only (grid -> scenario paths with invalidation -> risk boundary ->
 * review alignment), never market data.
 *
 * Without JS (or before hydration) every step is fully readable in order
 * and the panel shows the first stage - the scroll behaviour is purely an
 * enhancement layer.
 */
const STAGES = [
  {
    id: "understand",
    number: "01",
    title: "Understand Context",
    description: "Read market structure, key levels, and the conditions currently in play before forming a view.",
    example: "Context first: what regime is the market in, and which levels actually matter right now?",
  },
  {
    id: "scenarios",
    number: "02",
    title: "Define Scenarios",
    description: "Set bullish and bearish scenarios with clear invalidation, instead of predicting a single outcome.",
    example: "Two controlled paths - each with the exact condition that proves it wrong.",
  },
  {
    id: "exposure",
    number: "03",
    title: "Control Exposure",
    description: "Size risk and plan the trade before entry, so no single decision can outweigh the process.",
    example: "A risk boundary limits the active area before anything is committed.",
  },
  {
    id: "review",
    number: "04",
    title: "Review Decisions",
    description: "Review what happened against the plan, not just the outcome, and feed it back into the next cycle.",
    example: "Plan and result layers are compared - the loop feeds the next decision.",
  },
] as const;

function StageVisual({ stageId }: { stageId: (typeof STAGES)[number]["id"] }) {
  switch (stageId) {
    case "understand":
      return (
        <svg viewBox="0 0 240 160" aria-hidden="true">
          <rect x="20" y="20" width="200" height="120" rx="6" fill="none" stroke="var(--border)" strokeWidth="1" />
          {[1, 2, 3, 4].map((i) => (
            <line key={i} x1={20 + i * 40} y1="20" x2={20 + i * 40} y2="140" stroke="var(--grid-line-strong)" strokeWidth="1" />
          ))}
          {[1, 2].map((i) => (
            <line key={i} x1="20" y1={20 + i * 40} x2="220" y2={20 + i * 40} stroke="var(--grid-line-strong)" strokeWidth="1" />
          ))}
          <circle cx="140" cy="60" r="7" fill="var(--cyan)" />
          <circle cx="100" cy="100" r="7" fill="var(--aqua)" opacity=".7" />
          <rect x="20" y="20" width="200" height="120" rx="6" fill="none" stroke="var(--cyan)" strokeWidth="1.5" opacity=".5" />
        </svg>
      );
    case "scenarios":
      return (
        <svg viewBox="0 0 240 160" aria-hidden="true">
          <circle cx="40" cy="80" r="7" fill="var(--ink)" />
          <path d="M47 76 L150 34" stroke="var(--success)" strokeWidth="2" fill="none" />
          <path d="M47 84 L150 126" stroke="var(--danger)" strokeWidth="2" fill="none" />
          <circle cx="155" cy="30" r="6" fill="var(--success)" />
          <circle cx="155" cy="130" r="6" fill="var(--danger)" />
          <line x1="170" y1="30" x2="220" y2="30" stroke="var(--success)" strokeWidth="1.5" strokeDasharray="3 4" />
          <line x1="170" y1="130" x2="220" y2="130" stroke="var(--danger)" strokeWidth="1.5" strokeDasharray="3 4" />
          <line x1="30" y1="80" x2="225" y2="80" stroke="var(--muted)" strokeWidth="1" strokeDasharray="2 6" opacity=".7" />
        </svg>
      );
    case "exposure":
      return (
        <svg viewBox="0 0 240 160" aria-hidden="true">
          <line x1="20" y1="80" x2="220" y2="80" stroke="var(--border)" strokeWidth="2" />
          <rect x="90" y="66" width="60" height="28" rx="4" fill="var(--gold-soft)" stroke="var(--gold)" strokeWidth="1.5" />
          <line x1="90" y1="60" x2="90" y2="100" stroke="var(--danger)" strokeWidth="2" />
          <line x1="150" y1="60" x2="150" y2="100" stroke="var(--success)" strokeWidth="2" />
          <circle cx="120" cy="80" r="5" fill="var(--ink)" />
          <rect x="40" y="36" width="160" height="88" rx="8" fill="none" stroke="var(--node-line)" strokeWidth="1.2" strokeDasharray="4 8" />
        </svg>
      );
    case "review":
      return (
        <svg viewBox="0 0 240 160" aria-hidden="true">
          <rect x="52" y="46" width="136" height="52" rx="6" fill="none" stroke="var(--node-line)" strokeWidth="1.4" strokeDasharray="5 6" />
          <rect x="52" y="62" width="136" height="52" rx="6" fill="none" stroke="var(--cyan)" strokeWidth="1.6" />
          <path d="M70 34 a 58 58 0 1 1 -12 84" fill="none" stroke="var(--aqua)" strokeWidth="2" strokeLinecap="round" opacity=".8" />
          <polygon points="52,116 60,136 76,122" fill="var(--aqua)" />
        </svg>
      );
    default:
      return null;
  }
}

export function KiraMethodStory() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const steps = stepRefs.current.filter((el): el is HTMLLIElement => el !== null);
    if (steps.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = steps.indexOf(entry.target as HTMLLIElement);
            if (index !== -1) setActive(index);
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );
    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="method-story">
      <div className="method-story-panel" aria-hidden="true">
        <div className="method-story-visuals">
          {STAGES.map((stage, index) => (
            <div key={stage.id} className={`method-story-visual${active === index ? " active" : ""}`}>
              <StageVisual stageId={stage.id} />
            </div>
          ))}
        </div>
        <div className="method-story-progress">
          {STAGES.map((stage, index) => (
            <span key={stage.id} className={active === index ? "active" : ""} />
          ))}
        </div>
        <p className="method-story-example">{STAGES[active].example}</p>
      </div>
      <ol className="method-story-steps">
        {STAGES.map((stage, index) => (
          <li
            key={stage.id}
            ref={(el) => {
              stepRefs.current[index] = el;
            }}
            className={`method-story-step${active === index ? " active" : ""}`}
          >
            <span className="step-node" aria-hidden="true">{stage.number}</span>
            <div className="method-story-step-visual" aria-hidden="true">
              <StageVisual stageId={stage.id} />
            </div>
            <h3>{stage.title}</h3>
            <p>{stage.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
