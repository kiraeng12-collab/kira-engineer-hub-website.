import type { ComparisonColumn, ComparisonRow } from "@/components/ComparisonTable";

/**
 * Single source of truth for the Free vs VIP (and Academy) feature comparison,
 * shared by the homepage preview and the full /membership/compare page.
 * Keeping this in one place avoids the two surfaces silently drifting out of
 * sync. Project 242 is deliberately excluded - its public details remain
 * intentionally limited, so it is not compared here.
 */
export const comparisonColumns: ComparisonColumn[] = [
  { key: "community", label: "Kira Trading Community" },
  { key: "vip", label: "KIRA VIP Membership" },
  { key: "academy", label: "KIRA Academy" },
];

export const comparisonRows: ComparisonRow[] = [
  {
    label: "Public educational updates",
    values: { community: "Yes", vip: "Yes", academy: "No" },
  },
  {
    label: "Private educational analysis",
    values: { community: "No", vip: "Yes", academy: "Planned" },
  },
  {
    label: "Market scenarios",
    values: { community: "General", vip: "Structured", academy: "Planned" },
  },
  {
    label: "Community discussion",
    values: { community: "Public", vip: "Private", academy: "No" },
  },
  {
    label: "Structured course material",
    values: { community: "No", vip: "No", academy: "Planned" },
  },
  {
    label: "Risk-management framework",
    values: { community: "General", vip: "Risk-aware planning", academy: "Planned" },
  },
  {
    label: "Telegram delivery",
    values: { community: "Yes", vip: "Yes", academy: "To be announced" },
  },
  {
    label: "Recurring membership",
    values: { community: "No, free", vip: "Yes", academy: "To be announced" },
  },
  {
    label: "Current availability",
    values: { community: "Live", vip: "Live / checkout preparing", academy: "Coming soon" },
  },
  {
    label: "Intended participant",
    values: {
      community: "Anyone learning the markets",
      vip: "Traders wanting structured discussion",
      academy: "Future structured learners",
    },
  },
  {
    label: "Payment model",
    values: { community: "Free", vip: "Recurring monthly or quarterly", academy: "To be announced" },
  },
];
