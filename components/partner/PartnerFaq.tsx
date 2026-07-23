"use client";

import { trackEvent } from "@/lib/analytics";

/**
 * Accessible FAQ built on native <details>/<summary> - full keyboard and
 * screen-reader support with no custom ARIA needed. Reports a coarse analytics
 * event (the question label only) when an item is opened.
 */
export function PartnerFaq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="partner-faq">
      {items.map((item, i) => (
        <details
          key={item.q}
          name="partner-faq"
          onToggle={(e) => {
            if ((e.currentTarget as HTMLDetailsElement).open) {
              trackEvent("partner_faq_open", { index: i });
            }
          }}
        >
          <summary>
            <span>{item.q}</span>
            <span className="partner-faq-icon" aria-hidden="true" />
          </summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
