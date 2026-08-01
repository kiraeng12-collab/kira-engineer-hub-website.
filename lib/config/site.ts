/**
 * Central site configuration — single source of truth for company, contact,
 * social, and launch values. Replaces the old scripts/site-config.js,
 * scripts/legal-config.js (non-legal fields), and src/config/site.ts.
 */

export const siteConfig = {
  companyName: "Kira Engineer Hub",
  tagline: "Trading Education Tech",
  websiteUrl: "https://www.kiraengineerhub.com",

  contact: {
    general: "support@ke-hub.com",
    support: "support@ke-hub.com",
    privacy: "support@ke-hub.com",
    complaints: "support@ke-hub.com",
  },

  social: {
    telegramCommunity: "https://t.me/KiraTradingCommunity",
    telegramMembershipSupport: "https://t.me/KIRAENGINEER",
    // Official Kira Engineer Hub brand accounts.
    instagram: "https://www.instagram.com/kiraenghub/",
    x: "https://x.com/kiraenghub",
    // Founder + trading-community Instagram accounts.
    instagramFounder: "https://www.instagram.com/kira.engineer/",
    instagramTrading: "https://www.instagram.com/kira.tradingc/",
  },

  launch: {
    launchDate: "2026-08-01T00:00:00+04:00",
    earlyBirdCutoffDate: "2026-08-01T00:00:00+04:00",
    announcementActive: true,
    announcementExpiresAt: "2026-08-15T00:00:00+04:00",
  },

  products: {
    community: "live",
    membership: "preparing-checkout",
    academy: "coming-soon",
    project242: "in-development",
    shop: "coming-soon",
    technology: "roadmap",
  },
} as const;

export type SiteConfig = typeof siteConfig;
