/**
 * Hidden SVG symbol sprite shared by the retired brand mark and the footer
 * social icons (all referenced elsewhere via <use href="#id">). Ported
 * verbatim from the original index.html markup. Rendered once in the root
 * layout.
 */
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="ke-market-mark" viewBox="0 0 100 100">
          <line x1="25" y1="12" x2="25" y2="88" stroke="currentColor" strokeWidth="9" strokeLinecap="square" />
          <line x1="25" y1="50" x2="78" y2="15" stroke="currentColor" strokeWidth="9" strokeLinecap="square" />
          <line x1="25" y1="50" x2="78" y2="85" stroke="currentColor" strokeWidth="9" strokeLinecap="square" />
          <line x1="32.9" y1="60.5" x2="48.9" y2="60.5" stroke="var(--teal)" strokeWidth="7" strokeLinecap="square" />
          <line x1="46.1" y1="69.25" x2="62.1" y2="69.25" stroke="var(--teal)" strokeWidth="7" strokeLinecap="square" />
          <line x1="59.4" y1="78" x2="75.4" y2="78" stroke="var(--teal)" strokeWidth="7" strokeLinecap="square" />
          <rect x="19" y="40" width="12" height="20" fill="var(--teal)" />
          <line x1="25" y1="33" x2="25" y2="67" stroke="var(--cyan)" strokeWidth="3" />
        </symbol>
        <symbol id="social-telegram" viewBox="0 0 24 24">
          <path
            d="M21 4.8 17.9 20c-.2 1-1.2 1.2-2 .7l-5.5-4.1-2.7 2.6c-.3.3-.6.5-1.1.5l.4-5.7L17.5 6.6c.5-.4-.1-.6-.7-.2L4 14.5l-5.5-1.7c-1-.3-1-1 .2-1.5L19.7 3.2c.9-.4 1.7.2 1.3 1.6z"
            fill="currentColor"
          />
        </symbol>
        <symbol id="social-instagram" viewBox="0 0 24 24">
          <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="17.4" cy="6.8" r="1.2" fill="currentColor" />
        </symbol>
        <symbol id="social-email" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="14" rx="2.4" fill="none" stroke="currentColor" strokeWidth="2" />
          <path
            d="M4.5 7.2 12 13l7.5-5.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>
      </defs>
    </svg>
  );
}
