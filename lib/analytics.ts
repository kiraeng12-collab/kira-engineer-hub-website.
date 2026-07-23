/**
 * Provider-agnostic analytics dispatch.
 *
 * The site has no analytics provider wired in yet, so this is deliberately a
 * safe no-op that only forwards to a provider once one exists:
 *   - pushes to window.dataLayer if a tag manager is later added, and
 *   - dispatches a DOM CustomEvent ("kira:analytics") that any future
 *     provider bridge can subscribe to.
 *
 * It never loads a script, sets a cookie, or sends a network request on its
 * own, so it adds no dependency and no privacy surface. Only pass event names
 * and coarse, non-identifying properties - never emails, names, or free text.
 */

export type AnalyticsProps = Record<string, string | number | boolean>;

type DataLayerWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
};

export function trackEvent(event: string, props: AnalyticsProps = {}): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as DataLayerWindow;
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event, ...props });
    }
    window.dispatchEvent(new CustomEvent("kira:analytics", { detail: { event, ...props } }));
  } catch {
    // Analytics must never break the UI.
  }
}
