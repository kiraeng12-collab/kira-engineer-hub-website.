import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { BrandLogo } from "@/components/BrandLogo";
import { TelegramLink } from "@/components/TelegramLink";
import { CurrentYear } from "./CurrentYear";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <div className="footer-brand">
            <BrandLogo context="footer" />
          </div>
          <p className="muted">Trading education, risk discipline, community access, and financial technology.</p>
        </div>
        <div className="footer-col">
          <h3>Company</h3>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/founder">Founder</Link></li>
            <li><Link href="/#method">Our Method</Link></li>
            <li><Link href="/ecosystem">Ecosystem</Link></li>
            <li><Link href="/contact">Careers</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Products</h3>
          <ul>
            <li><Link href="/community">Kira Trading Community</Link></li>
            <li><Link href="/membership">KIRA VIP Membership</Link></li>
            <li><Link href="/academy">KIRA Academy</Link></li>
            <li><Link href="/project-242">Project 242</Link></li>
            <li><Link href="/shop">KIRA Shop</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Resources</h3>
          <ul>
            <li><Link href="/insights">Insights</Link></li>
            <li><Link href="/weekly-analysis">Weekly Analysis</Link></li>
            <li><Link href="/faq">Frequently Asked Questions</Link></li>
            <li><Link href="/updates">Company Updates</Link></li>
            <li><Link href="/support">Support</Link></li>
            <li><Link href="/community-rules">Community Rules</Link></li>
            <li><Link href="/partner-program">Partner Program</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Legal</h3>
          <ul>
            <li><Link href="/legal">Legal Center</Link></li>
            <li><Link href="/legal/terms">Terms of Use</Link></li>
            <li><Link href="/legal/membership-terms">Membership Terms</Link></li>
            <li><Link href="/legal/risk-disclosure">Risk Disclosure</Link></li>
            <li><Link href="/legal/privacy">Privacy Policy</Link></li>
            <li><Link href="/legal/refund-policy">Refund &amp; Cancellation</Link></li>
            <li><button type="button" data-cookie-settings>Cookie Settings</button></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Connect</h3>
          <ul>
            <li>
              <TelegramLink className="footer-social" href={siteConfig.social.telegramCommunity}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#social-telegram" /></svg>
                <span>Telegram Community</span>
              </TelegramLink>
            </li>
            <li>
              <TelegramLink className="footer-social" href={siteConfig.social.telegramMembershipSupport}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#social-telegram" /></svg>
                <span>Membership Support</span>
              </TelegramLink>
            </li>
            <li>
              <a className="footer-social" href={siteConfig.social.instagramFounder} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#social-instagram" /></svg>
                <span>@kira.engineer</span>
              </a>
            </li>
            <li>
              <a className="footer-social" href={siteConfig.social.instagramTrading} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#social-instagram" /></svg>
                <span>@kira.tradingc</span>
              </a>
            </li>
            <li>
              <a className="footer-social" href={`mailto:${siteConfig.contact.general}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#social-email" /></svg>
                <span>{siteConfig.contact.general}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container risk-box">
        <strong>Risk warning:</strong> Trading financial markets, including forex, crypto, stocks, indices,
        commodities, and leveraged products, involves substantial risk and may result in partial or total loss of
        capital. Kira Engineer Hub content is education and general information only and is not personalized
        financial, investment, legal or tax advice.
      </div>
      <div className="container copyright">
        <span>
          &copy; <CurrentYear /> {siteConfig.companyName}. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
