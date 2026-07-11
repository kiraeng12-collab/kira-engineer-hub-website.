import type { ComparisonColumn, ComparisonRow } from "@/components/ComparisonTable";

/**
 * Single source of truth for the Free vs VIP (and Academy / Project 242)
 * feature comparison, shared by the homepage preview and the full
 * /membership/compare page. Keeping this in one place avoids the two
 * surfaces silently drifting out of sync.
 */
export const comparisonColumns: ComparisonColumn[] = [
  { key: "community", label: "Kira Trading Community" },
  { key: "vip", label: "KIRA VIP Membership" },
  { key: "academy", label: "KIRA Academy" },
  { key: "project242", label: "Project 242" },
];

export const comparisonRows: ComparisonRow[] = [
  {
    label: "Public educational updates",
    values: { community: "Yes", vip: "Yes", academy: "No", project242: "No" },
  },
  {
    label: "Private educational analysis",
    values: { community: "No", vip: "Yes", academy: "Planned", project242: "No" },
  },
  {
    label: "Market scenarios",
    values: { community: "General", vip: "Structured", academy: "Planned", project242: "No" },
  },
  {
    label: "Community discussion",
    values: { community: "Public", vip: "Private", academy: "No", project242: "No" },
  },
  {
    label: "Structured course material",
    values: { community: "No", vip: "No", academy: "Planned", project242: "No" },
  },
  {
    label: "Risk-management framework",
    values: { community: "General", vip: "Risk-aware planning", academy: "Planned", project242: "Core focus" },
  },
  {
    label: "Telegram delivery",
    values: { community: "Yes", vip: "Yes", academy: "To be announced", project242: "Not applicable" },
  },
  {
    label: "Recurring membership",
    values: { community: "No, free", vip: "Yes", academy: "To be announced", project242: "Not available" },
  },
  {
    label: "Current availability",
    values: { community: "Live", vip: "Live / checkout preparing", academy: "Coming soon", project242: "In development" },
  },
  {
    label: "Intended participant",
    values: {
      community: "Anyone learning the markets",
      vip: "Traders wanting structured discussion",
      academy: "Future structured learners",
      project242: "Not public yet",
    },
  },
  {
    label: "Payment model",
    values: { community: "Free", vip: "Recurring monthly or quarterly", academy: "To be announced", project242: "Not available for purchase" },
  },
];
