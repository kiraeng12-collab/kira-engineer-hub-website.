import Image from "next/image";

/**
 * Project 242 protected visual experience. The 2-4-2 structure is drawn as
 * three concentric decision layers - 2 outer arcs, 4 middle arcs, 2 inner
 * arcs - around the official Project 242 mark, with locked blocks marking
 * protected information. Deliberately unlabelled per owner instruction:
 * the layers carry no stage names or framing of any kind, only the public
 * 2-4-2 shape itself. No formulas, scoring, checklists or process logic.
 *
 * Arc counts come from stroke-dasharray on full circles (circumference
 * split into n dashes), so the geometry is exact. Layer rotation is pure
 * CSS, runs only under prefers-reduced-motion: no-preference, and the
 * static frame is the design itself - no JS anywhere in this component.
 */
export function Project242Experience() {
  return (
    <div className="p242-exp" aria-hidden="true">
      <svg viewBox="0 0 400 400">
        <circle className="p242-boundary" cx="200" cy="200" r="194" />
        <g className="p242-layer p242-layer-outer">
          {/* 2 arcs: c(180) = 1130.97 -> (505 + 60) * 2 */}
          <circle cx="200" cy="200" r="180" fill="none" stroke="var(--muted)" strokeWidth="2" strokeDasharray="505 60" strokeLinecap="round" />
        </g>
        <g className="p242-layer p242-layer-mid">
          {/* 4 arcs: c(138) = 867.08 -> (177 + 39.77) * 4 */}
          <circle cx="200" cy="200" r="138" fill="none" stroke="var(--cyan)" strokeWidth="2.4" strokeDasharray="177 39.77" strokeLinecap="round" />
        </g>
        <g className="p242-layer p242-layer-inner">
          {/* 2 arcs: c(96) = 603.19 -> (251.6 + 50) * 2 */}
          <circle cx="200" cy="200" r="96" fill="none" stroke="var(--gold)" strokeWidth="2.2" strokeDasharray="251.6 50" strokeLinecap="round" />
        </g>

        {/* Locked information blocks - protected content markers only */}
        <g className="p242-lock" transform="translate(324, 118)">
          <rect x="-15" y="-4" width="30" height="24" rx="4" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="1.5" />
          <path d="M-6 -4 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke="var(--muted)" strokeWidth="2" />
          <circle cx="0" cy="7" r="2.2" fill="var(--muted)" />
        </g>
        <g className="p242-lock" transform="translate(66, 262)">
          <rect x="-15" y="-4" width="30" height="24" rx="4" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="1.5" />
          <path d="M-6 -4 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke="var(--muted)" strokeWidth="2" />
          <circle cx="0" cy="7" r="2.2" fill="var(--muted)" />
        </g>
        <g className="p242-lock" transform="translate(285, 310)">
          <rect x="-15" y="-4" width="30" height="24" rx="4" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="1.5" />
          <path d="M-6 -4 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke="var(--muted)" strokeWidth="2" />
          <circle cx="0" cy="7" r="2.2" fill="var(--muted)" />
        </g>

        <text x="200" y="392" textAnchor="middle" fill="var(--muted)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="3">
          2 - 4 - 2 / PROTECTED
        </text>
      </svg>
      <div className="p242-mark">
        <Image src="/project-242-mark-thumb.webp" width={92} height={92} alt="" />
      </div>
    </div>
  );
}
