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
    general: "KE@kiraengineerhub.com",
    support: "KE@kiraengineerhub.com",
    privacy: "KE@kiraengineerhub.com",
    complaints: "KE@kiraengineerhub.com",
  },

  social: {
    telegramCommunity: "https://t.me/KiraTradingCommunity",
    telegramMembershipSupport: "https://t.me/KIRAENGINEER",
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
