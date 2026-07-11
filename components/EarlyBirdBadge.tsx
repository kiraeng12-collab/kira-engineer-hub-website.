/**
 * Restrained gold accent, used narrowly for Early Bird eligibility per the
 * approved brand-asset rule (docs/design-tokens.md) - never a primary color.
 */
export function EarlyBirdBadge({ label = "Early Bird Eligible" }: { label?: string }) {
  return <span className="early-bird-badge">{label}</span>;
}
