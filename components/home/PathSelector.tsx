"use client";

import { useId, useRef, useState } from "react";
import { ActionLink } from "@/components/ActionLink";
import { ProductLogo, type ProductLogoName } from "@/components/ProductLogo";
import { StatusBadge, type ProductStatus } from "@/components/StatusBadge";
import { siteConfig } from "@/lib/config/site";

/**
 * Reuses the same product data already public on /ecosystem (name, status,
 * description) - this section is a new interactive presentation of existing
 * content, not new claims.
 */
const PATHS: {
  id: string;
  pathLabel: string;
  pathDescription: string;
  productName: string;
  logo?: ProductLogoName;
  status: ProductStatus;
  description: string;
  benefits: string[];
  cta: { label: string; href: string };
}[] = [
  {
    id: "explore",
    pathLabel: "Explore Freely",
    pathDescription: "For public market education and community updates.",
    productName: "Kira Trading Community",
    logo: "community",
    status: siteConfig.products.community,
    description:
      "Free public Telegram community for educational market updates, general insights, announcements, and community content.",
    benefits: ["Free public access", "Market updates and announcements", "Community discussion"],
    cta: { label: "Join Free Community", href: siteConfig.social.telegramCommunity },
  },
  {
    id: "structure",
    pathLabel: "Develop Structure",
    pathDescription: "For deeper structured analysis and private community access.",
    productName: "KIRA VIP Membership",
    logo: "vip",
    status: siteConfig.products.membership,
    description:
      "Private recurring educational membership for structured market discussion, risk-aware planning, learning resources, and community support.",
    benefits: ["Structured market discussion", "Risk-aware planning resources", "Community support"],
    cta: { label: "View Membership", href: "/membership" },
  },
  {
    id: "knowledge",
    pathLabel: "Build Knowledge",
    pathDescription: "For structured educational courses.",
    productName: "KIRA Academy",
    logo: "academy",
    status: siteConfig.products.academy,
    description: "Structured educational courses and trader-development programmes will be released only when content and delivery are ready.",
    benefits: ["Structured educational courses", "Trader-development programmes", "Released when ready"],
    cta: { label: "Explore Academy", href: "/academy" },
  },
  {
    id: "innovation",
    pathLabel: "Follow Innovation",
    pathDescription: "For Project 242 and future risk technology.",
    productName: "Project 242",
    logo: "project242",
    status: siteConfig.products.project242,
    description: "A private Kira Engineer initiative. Public details remain intentionally limited while development continues.",
    benefits: ["Private initiative", "Currently in development", "No public details yet"],
    cta: { label: "Follow Development", href: "/project-242" },
  },
];

function PlaceholderMark({ label }: { label: string }) {
  return (
    <span className="placeholder-mark" aria-hidden="true">
      {label.charAt(0)}
    </span>
  );
}

export function PathSelector() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  function focusPath(index: number) {
    const next = (index + PATHS.length) % PATHS.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusPath(active + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusPath(active - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusPath(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusPath(PATHS.length - 1);
    }
  }

  const path = PATHS[active];

  return (
    <div className="path-selector">
      <div className="path-tabs" role="tablist" aria-label="Choose your KIRA path" onKeyDown={onKeyDown}>
        {PATHS.map((p, index) => (
          <button
            key={p.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${p.id}`}
            aria-selected={active === index}
            aria-controls={`${baseId}-panel-${p.id}`}
            tabIndex={active === index ? 0 : -1}
            className={`path-tab${active === index ? " active" : ""}`}
            onClick={() => setActive(index)}
          >
            <strong>{p.pathLabel}</strong>
            <span>{p.pathDescription}</span>
          </button>
        ))}
      </div>
      <div
        className="path-panel"
        role="tabpanel"
        id={`${baseId}-panel-${path.id}`}
        aria-labelledby={`${baseId}-tab-${path.id}`}
        tabIndex={0}
      >
        <div className="path-panel-head">
          {path.logo ? <ProductLogo product={path.logo} size={56} /> : <PlaceholderMark label={path.productName} />}
          <div>
            <StatusBadge status={path.status} />
            <h3>{path.productName}</h3>
          </div>
        </div>
        <p>{path.description}</p>
        <ul className="path-benefits">
          {path.benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
        <ActionLink className="button secondary" href={path.cta.href}>
          {path.cta.label}
        </ActionLink>
      </div>
    </div>
  );
}
