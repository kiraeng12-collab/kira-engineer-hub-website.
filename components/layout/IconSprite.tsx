/**
 * Hidden SVG symbol sprite for the footer social icons (referenced via
 * <use href="#id">). Rendered once in the root layout. All brand marks are
 * official image assets now - never hand-drawn SVG recreations.
 */
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
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
