export type MembershipStatus =
  | "pending"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired"
  | "suspended"
  | "refunded"
  | "disputed";

/**
 * Maps a Stripe Subscription.status value to our internal Membership
 * status vocabulary (Section 16). Defensive default of "pending" for any
 * unrecognized/future Stripe status rather than guessing.
 */
export function mapSubscriptionStatus(stripeStatus: string): MembershipStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "cancelled";
    case "unpaid":
    case "paused":
      return "suspended";
    case "incomplete_expired":
      return "expired";
    case "incomplete":
    default:
      return "pending";
  }
}
