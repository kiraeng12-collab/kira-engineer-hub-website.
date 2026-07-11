import type { Metadata } from "next";
import { Sora } from "next/font/google";
import Script from "next/script";
import { siteConfig } from "@/lib/config/site";
import { IconSprite } from "@/components/layout/IconSprite";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import "./globals.css";
import "./doc-page.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.websiteUrl),
  title: {
    default: "Kira Engineer Hub | Trading Education, Risk Discipline and Technology",
    template: "%s | Kira Engineer Hub",
  },
  description:
    "Kira Engineer Hub brings structured trading education, risk-first market analysis, community access, and financial technology into one connected ecosystem.",
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Kira Engineer Hub",
    images: ["/ke-hub-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ke-hub-logo.png"],
  },
};

export const viewport = {
  themeColor: "#0B1118",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={sora.className}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <IconSprite />
        <SessionProviderWrapper>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </SessionProviderWrapper>
        <Script src="/scripts/cookie-consent.js" strategy="afterInteractive" />
        <Script src="/scripts/form-handler.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
