import type { Metadata } from "next";
import Link from "next/link";
import { ActionLink } from "@/components/ActionLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StatusBadge } from "@/components/StatusBadge";
import { ProductLogo, type ProductLogoName } from "@/components/ProductLogo";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Ecosystem",
  description:
    "Explore the Kira Engineer Hub ecosystem: Kira Trading Community, KIRA VIP Membership, KIRA Academy, Project 242, and the future KIRA Shop.",
  alternates: { canonical: "/ecosystem" },
};

const products: {
  name: string;
  status: (typeof siteConfig.products)[keyof typeof siteConfig.products];
  audience: string;
  description: string;
  cta: { label: string; href: string };
  logo?: ProductLogoName;
}[] = [
  {
    name: "Kira Trading Community",
    status: siteConfig.products.community,
    logo: "community",
    audience: "Anyone learning the markets who wants free public education.",
    description: "Free public Telegram community for educational market updates, general insights, announcements, and community content.",
    cta: { label: "Join Free Community", href: siteConfig.social.telegramCommunity },
  },
  {
    name: "KIRA VIP Membership",
    status: siteConfig.products.membership,
    logo: "vip",
    audience: "Traders who want a more structured, private educational environment.",
    description: "Private recurring educational membership for structured market discussion, risk-aware planning, learning resources, and community support.",
    cta: { label: "Explore Membership", href: "/membership" },
  },
  {
    name: "KIRA Academy",
    status: siteConfig.products.academy,
    logo: "academy",
    audience: "Future structured learners seeking a complete course experience.",
    description: "Structured educational courses and trader-development programmes will be released only when content and delivery are ready.",
    cta: { label: "Explore Academy", href: "/academy" },
  },
  {
    name: "Project 242",
    status: siteConfig.products.project242,
    logo: "project242",
    audience: "Not publicly available yet.",
    description: "A private Kira Engineer initiative. Public details remain intentionally limited while development continues.",
    cta: { label: "Discover Project 242", href: "/project-242" },
  },
  {
    name: "KIRA Shop",
    status: siteConfig.products.shop,
    audience: "Community members interested in official brand merchandise.",
    description: "Future official merchandise may include apparel, laptop stickers, desk accessories, and selected community collectibles.",
    cta: { label: "View Shop", href: "/shop" },
  },
];

export default function EcosystemPage() {
  return (
    <div className="doc-page">
      <div className="doc-intro">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Ecosystem" }]} />
        <p className="eyebrow">Kira Engineer Hub Ecosystem</p>
        <h1>One connected trading-education ecosystem.</h1>
        <p className="meta">
          Public community, private membership, structured education, protected product development, and future
          official brand merchandise.
        </p>
      </div>
      <div className="doc-body">
        <section className="cards">
          {products.map((product) => (
            <article className="card" key={product.name}>
              {product.logo ? <ProductLogo product={product.logo} size={48} /> : null}
              <StatusBadge status={product.status} />
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p className="small-disclosure">{product.audience}</p>
              <ActionLink className="button" href={product.cta.href}>{product.cta.label}</ActionLink>
            </article>
          ))}
        </section>
        <p><Link className="text-link" href="/membership/compare">Compare products feature by feature</Link></p>
        <div className="risk-warning">
          <strong>Risk notice</strong>
          All content is educational and general information only. Kira Engineer Hub is not a broker, investment
          manager, or provider of guaranteed outcomes.
        </div>
      </div>
    </div>
  );
}
