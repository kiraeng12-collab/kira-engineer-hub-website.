/**
 * Controlled, abstract visual for Project 242: three concentric rings whose
 * segment counts spell out the "2-4-2" structure (2 outer arcs, 4 middle
 * arcs, 2 inner arcs), mapped to the approved public framing of Before /
 * During / After. No methodology, scoring logic, or real framework detail
 * is depicted - purely structural, matching Section 15's brief.
 */
export function Project242Visual() {
  return (
    <div className="project242-visual" aria-hidden="true">
      <svg viewBox="0 0 300 300">
        <circle
          className="ring ring-outer"
          cx="150" cy="150" r="110"
          fill="none" stroke="var(--muted)" strokeWidth="2"
          strokeDasharray="320 25.4"
        />
        <circle
          className="ring ring-middle"
          cx="150" cy="150" r="80"
          fill="none" stroke="var(--cyan)" strokeWidth="2"
          strokeDasharray="110 15.7"
        />
        <circle
          className="ring ring-inner"
          cx="150" cy="150" r="50"
          fill="none" stroke="var(--gold)" strokeWidth="2"
          strokeDasharray="145 12"
        />

        <text x="150" y="34" textAnchor="middle" fill="var(--muted)" fontSize="12" fontFamily="var(--font-mono)" letterSpacing="2">BEFORE</text>
        <text x="150" y="64" textAnchor="middle" fill="var(--cyan-bright, var(--aqua))" fontSize="12" fontFamily="var(--font-mono)" letterSpacing="2">DURING</text>
        <text x="150" y="94" textAnchor="middle" fill="var(--gold)" fontSize="12" fontFamily="var(--font-mono)" letterSpacing="2">AFTER</text>

        <g transform="translate(150,150)">
          <rect x="-13" y="-3" width="26" height="22" rx="3" fill="var(--surface-2)" stroke="var(--gold)" strokeWidth="2" />
          <path d="M-7 -3 v-6 a7 7 0 0 1 14 0 v6" fill="none" stroke="var(--gold)" strokeWidth="2.4" />
          <circle cx="0" cy="9" r="2.4" fill="var(--gold)" />
        </g>
      </svg>
    </div>
  );
}
