import { pricingConfig, type MembershipTier } from "./pricing";

/**
 * Loyalty tier rules, keyed on when a member joined Kira Trading Community.
 *
 * Agreed 2026-07-21:
 *   joined in 2024 or earlier            -> "founding"   (deepest, permanent)
 *   joined 2025 up to the 1 Aug 2026 cut -> "early_bird" (20% off, permanent)
 *   joined on/after 1 Aug 2026           -> null         (standard pricing)
 *
 * Kept as pure functions so the rule is unit-testable and can never drift
 * between checkout, the claim flow and the import script.
 */

/** Anyone who joined before this instant is a Founding Member. */
export const FOUNDING_WINDOW_END = new Date("2025-01-01T00:00:00Z");

/** Anyone who joined on/after this instant pays standard pricing. */
export const EARLY_BIRD_CUTOFF = new Date(pricingConfig.earlyBirdCutoffDate);

export function tierForJoinDate(joinedAt: Date): MembershipTier | null {
  const time = joinedAt.getTime();
  if (Number.isNaN(time)) return null;
  if (time < FOUNDING_WINDOW_END.getTime()) return "founding";
  if (time < EARLY_BIRD_CUTOFF.getTime()) return "early_bird";
  return null;
}

/** Human-readable reason, stored on the claim for audit/support. */
export function describeTier(tier: MembershipTier | null): string {
  if (tier === "founding") return "Founding Member (joined 2024 or earlier)";
  if (tier === "early_bird") return "Early Bird (joined before 1 August 2026)";
  return "Standard pricing";
}

/**
 * Only ever upgrade a member's tier. If someone was already granted the deeper
 * discount (e.g. by manual review), an automated import must not downgrade it.
 */
const TIER_RANK: Record<string, number> = { early_bird: 1, founding: 2 };

export function bestTier(
  current: MembershipTier | null,
  incoming: MembershipTier | null
): MembershipTier | null {
  const currentRank = current ? TIER_RANK[current] ?? 0 : 0;
  const incomingRank = incoming ? TIER_RANK[incoming] ?? 0 : 0;
  return incomingRank > currentRank ? incoming : current;
}
