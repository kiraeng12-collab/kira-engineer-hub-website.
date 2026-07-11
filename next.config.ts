import type { NextConfig } from "next";

const legacyLegalRedirects = [
  { source: "/terms", destination: "/legal/terms" },
  { source: "/privacy", destination: "/legal/privacy" },
  { source: "/cookies", destination: "/legal/cookie-policy" },
  { source: "/membership-terms", destination: "/legal/membership-terms" },
  { source: "/risk-disclosure", destination: "/legal/risk-disclosure" },
  { source: "/refund-cancellation", destination: "/legal/refund-policy" },
  { source: "/regulatory-notice", destination: "/legal/regulatory-notice" },
  { source: "/affiliate-disclosure", destination: "/legal/affiliate-disclosure" },
  { source: "/project-242-terms", destination: "/legal/project-242-terms" },
  { source: "/accessibility", destination: "/legal/accessibility" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      ...legacyLegalRedirects.map((redirect) => ({
        ...redirect,
        permanent: true,
      })),
      {
        source: "/affiliate-program",
        destination: "/partner-program",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
