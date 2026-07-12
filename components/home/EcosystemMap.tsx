"use client";

import { useId, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductLogo, type ProductLogoName } from "@/components/ProductLogo";
import { StatusBadge, type ProductStatus } from "@/components/StatusBadge";
import { siteConfig } from "@/lib/config/site";

/**
 * Real product/touchpoint structure, not illustrative data: KIRA Trading
 * Channel is Kira Trading Community's public Telegram channel; KIRA VIP
 * Group and KIRA Bot are KIRA VIP Membership's private group and the
 * verification bot already live at /account/telegram. Academy and
 * Project 242 have no Telegram sub-touchpoints, so they render as leaf
 * nodes with no expand control.
 */
const NODES: {
  id: string;
  logo: ProductLogoName;
  name: string;
  status: ProductStatus;
  description: string;
  href: string;
  children: { logo: ProductLogoName; name: string; description: string }[];
}[] = [
  {
    id: "community",
    logo: "community",
    name: "Kira Trading Community",
    status: siteConfig.products.community,
    description: "Free public Telegram community for educational updates and general market discussion.",
    href: "/community",
    children: [
      {
        logo: "tradingChannel",
        name: "KIRA Trading Channel",
        description: "Public Telegram channel for community announcements and market updates.",
      },
    ],
  },
  {
    id: "vip",
    logo: "vip",
    name: "KIRA VIP Membership",
    status: siteConfig.products.membership,
    description: "Private recurring membership for structured market discussion and risk-aware planning.",
    href: "/membership",
    children: [
      {
        logo: "vipGroup",
        name: "KIRA VIP Group",
        description: "Private Telegram group for structured member discussion and support.",
      },
      {
        logo: "bot",
        name: "KIRA Bot",
        description: "Automated Telegram linking and membership verification.",
      },
    ],
  },
  {
    id: "academy",
    logo: "academy",
    name: "KIRA Academy",
    status: siteConfig.products.academy,
    description: "Structured educational courses, released only when content and delivery are ready.",
    href: "/academy",
    children: [],
  },
  {
    id: "project242",
    logo: "project242",
    name: "Project 242",
    status: siteConfig.products.project242,
    description: "A private Kira Engineer initiative. Public details remain intentionally limited.",
    href: "/project-242",
    children: [],
  },
];

export function EcosystemMap() {
  const baseId = useId();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="eco-map">
      <div className="eco-hub">
        <Image src="/kira-engineer-hub-wordmark.png" width={161} height={38} alt="Kira Engineer Hub" />
        <span className="eco-hub-label">Parent brand</span>
      </div>
      <ul className="eco-row">
        {NODES.map((node) => {
          const isExpanded = expanded.has(node.id);
          const childrenId = `${baseId}-${node.id}-children`;
          return (
            <li key={node.id} className="eco-node">
              <div className="eco-card">
                <ProductLogo product={node.logo} size={48} />
                <StatusBadge status={node.status} />
                <h3>
                  <Link href={node.href}>{node.name}</Link>
                </h3>
                <p>{node.description}</p>
                {node.children.length > 0 && (
                  <button
                    type="button"
                    className="eco-toggle"
                    aria-expanded={isExpanded}
                    aria-controls={childrenId}
                    onClick={() => toggle(node.id)}
                  >
                    {isExpanded ? "Hide Telegram touchpoints" : "Show Telegram touchpoints"}
                  </button>
                )}
              </div>
              {node.children.length > 0 && (
                <ul id={childrenId} className="eco-children" hidden={!isExpanded}>
                  {node.children.map((child) => (
                    <li key={child.name}>
                      <ProductLogo product={child.logo} size={28} />
                      <div>
                        <strong>{child.name}</strong>
                        <span>{child.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
