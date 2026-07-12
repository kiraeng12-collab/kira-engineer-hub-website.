"use client";

import { useId, useRef, useState } from "react";

/**
 * Interactive hero visual. Deliberately reuses the same four stages as the
 * KIRA Method section below (same titles/descriptions - not new content),
 * illustrated abstractly. No real or implied market data anywhere here -
 * every visual is geometric/abstract, per the brief's explicit rule against
 * fake prices, fake results, or implying the interface executes trades.
 */
const STAGES = [
  {
    id: "understand",
    number: "01",
    title: "Understand Context",
    description: "Read market structure, key levels, and the conditions currently in play before forming a view.",
  },
  {
    id: "scenarios",
    number: "02",
    title: "Define Scenarios",
    description: "Set bullish and bearish scenarios with clear invalidation, instead of predicting a single outcome.",
  },
  {
    id: "exposure",
    number: "03",
    title: "Control Exposure",
    description: "Size risk and plan the trade before entry, so no single decision can outweigh the process.",
  },
  {
    id: "review",
    number: "04",
    title: "Review Decisions",
    description: "Review what happened against the plan, not just the outcome, and feed it back into the next cycle.",
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
        </svg>
      );
    case "review":
      return (
        <svg viewBox="0 0 240 160" aria-hidden="true">
          <path
            d="M70 50 a 50 50 0 1 1 -8 70"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <polygon points="55,110 62,130 78,116" fill="var(--cyan)" />
          <circle cx="70" cy="50" r="6" fill="var(--aqua)" />
        </svg>
      );
    default:
      return null;
  }
}

export function DecisionEngine() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  function focusStage(index: number) {
    const next = (index + STAGES.length) % STAGES.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusStage(active + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusStage(active - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusStage(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusStage(STAGES.length - 1);
    }
  }

  const stage = STAGES[active];

  return (
    <div className="decision-engine">
      <div className="visual-top">
        <div>
          <strong>KIRA Decision Engine</strong>
          <span>Educational demonstration</span>
        </div>
      </div>
      <div className="decision-engine-tabs" role="tablist" aria-label="KIRA Decision Engine stages" onKeyDown={onKeyDown}>
        {STAGES.map((s, index) => (
          <button
            key={s.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${s.id}`}
            aria-selected={active === index}
            aria-controls={`${baseId}-panel-${s.id}`}
            tabIndex={active === index ? 0 : -1}
            className={`decision-engine-tab${active === index ? " active" : ""}`}
            onClick={() => setActive(index)}
          >
            <span className="step-node" aria-hidden="true">{s.number}</span>
            {s.title}
          </button>
        ))}
      </div>
      <div
        className="decision-engine-panel"
        role="tabpanel"
        id={`${baseId}-panel-${stage.id}`}
        aria-labelledby={`${baseId}-tab-${stage.id}`}
        tabIndex={0}
      >
        <div className="decision-engine-visual"><StageVisual stageId={stage.id} /></div>
        <p>{stage.description}</p>
      </div>
    </div>
  );
}
