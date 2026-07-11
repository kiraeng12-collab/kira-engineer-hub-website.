export type EarlyBirdStatus =
  | "submitted"
  | "under_review"
  | "evidence_required"
  | "approved"
  | "rejected"
  | "code_issued"
  | "redeemed"
  | "suspended";

/** User-facing summary of an Early Bird request status, shown on /account/early-bird. */
export function describeEarlyBirdStatus(status: string): { heading: string; body: string } {
  switch (status as EarlyBirdStatus) {
    case "submitted":
    case "under_review":
      return {
        heading: "Under review",
        body: "Your Early Bird eligibility request has been received and is awaiting review.",
      };
    case "evidence_required":
      return {
        heading: "Additional evidence requested",
        body: "We need a bit more information to verify your eligibility. Check your email for details, or contact support.",
      };
    case "approved":
    case "code_issued":
    case "redeemed":
      return {
        heading: "Verified",
        body: "Your Early Bird discount is active and will be applied automatically at checkout.",
      };
    case "rejected":
      return {
        heading: "Not approved",
        body: "We couldn't verify Early Bird eligibility from the records available. Contact support if you believe this is a mistake.",
      };
    case "suspended":
      return {
        heading: "Suspended",
        body: "Your Early Bird eligibility has been suspended. Contact support for details.",
      };
    default:
      return {
        heading: "Under review",
        body: "Your Early Bird eligibility request is being processed.",
      };
  }
}
