"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ActionLink } from "@/components/ActionLink";
import { ProductLogo, type ProductLogoName } from "@/components/ProductLogo";
import { StatusBadge, type ProductStatus } from "@/components/StatusBadge";
import { siteConfig } from "@/lib/config/site";

/**
 * THE KIRA INTELLIGENCE CORE - the immersive hero visual. A central Kira
 * Engineer Hub core connected to its four product nodes (official logos,
 * unchanged), surrounded by a risk-boundary ring, with scenario pathways
 * flowing along the active connection. Depth comes from CSS 3D perspective
 * + pointer tilt only - no WebGL, no library, so the static fallback is the
 * component itself with motion removed. Tilt is gated to fine pointers with
 * motion allowed; selection works by click/keyboard and never hides
 * information behind hover.
 *
 * Same approved product facts as /ecosystem - no new claims, no market data.
 */
const NODES: {
  id: string;
  logo: ProductLogoName;
  name: string;
  status: ProductStatus;
  description: string;
  cta: { label: string; href: string };
  x: number; // stage coords in a 520x520 space
  y: number;
}[] = [
  {
    id: "community",
    logo: "community",
    name: "Kira Trading Community",
    status: siteConfig.products.community,
    description: "Free public Telegram community for educational market updates and general discussion.",
    cta: { label: "Join Free Community", href: siteConfig.social.telegramCommunity },
    x: 109,
    y: 99,
  },
  {
    id: "vip",
    logo: "vip",
    name: "KIRA VIP Membership",
    status: siteConfig.products.membership,
    description: "Private structured analysis, risk-aware planning and organized educational access.",
    cta: { label: "Explore Membership", href: "/membership" },
    x: 411,
    y: 99,
  },
  {
    id: "academy",
    logo: "academy",
    name: "KIRA Academy",
    status: siteConfig.products.academy,
    description: "Structured courses and trader-development programmes, released when ready.",
    cta: { label: "Explore Academy", href: "/academy" },
    x: 109,
    y: 421,
  },
  {
    id: "project242",
    logo: "project242",
    name: "Project 242",
    status: siteConfig.products.project242,
    description: "Future risk-management systems and technology development. Details intentionally limited.",
    cta: { label: "Follow Development", href: "/project-242" },
    x: 411,
    y: 421,
  },
];

const CORE = { x: 260, y: 260 };

export function KiraIntelligenceCore() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef(0);
  const baseId = useId();

  /* Pointer tilt: fine pointers with motion allowed only. Writes transforms
     directly to the stage element inside rAF - no React re-renders. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rx = 0;
    let ry = 0;

    function schedule() {
      if (frameRef.current) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0;
        if (stage) stage.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    }

    function onPointerMove(event: PointerEvent) {
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      ry = px * 7;
      rx = -py * 7;
      schedule();
    }

    function onPointerLeave() {
      rx = 0;
      ry = 0;
      schedule();
    }

    stage.addEventListener("pointermove", onPointerMove, { passive: true });
    stage.addEventListener("pointerleave", onPointerLeave, { passive: true });
    return () => {
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  function focusNode(index: number) {
    const next = (index + NODES.length) % NODES.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusNode(active + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusNode(active - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusNode(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusNode(NODES.length - 1);
    }
  }

  const node = NODES[active];

  return (
    <div className="intel-core">
      <p className="visually-hidden">
        Diagram of the Kira Engineer Hub ecosystem: a central Kira Engineer Hub core connected to Kira Trading
        Community, KIRA VIP Membership, KIRA Academy and Project 242. Select a product to read its status and
        description below the diagram.
      </p>
      <div className="intel-stage-frame">
        <div className="intel-stage" ref={stageRef}>
          <svg className="intel-field" viewBox="0 0 520 520" aria-hidden="true">
            <circle className="intel-boundary" cx="260" cy="260" r="240" />
            <circle className="intel-orbit" cx="260" cy="260" r="158" />
            {NODES.map((n, index) => (
              <line
                key={n.id}
                className={`intel-link${active === index ? " active" : ""}`}
                x1={CORE.x}
                y1={CORE.y}
                x2={n.x}
                y2={n.y}
              />
            ))}
            {NODES.map((n, index) => (
              <line
                key={`${n.id}-flow`}
                className={`intel-flow${active === index ? " active" : ""}`}
                x1={CORE.x}
                y1={CORE.y}
                x2={n.x}
                y2={n.y}
              />
            ))}
          </svg>
          <div className="intel-hub" style={{ left: "50%", top: "50%" }}>
            <Image src="/kira-engineer-hub-wordmark.png" width={170} height={29} alt="Kira Engineer Hub" priority />
            <span>Intelligence Core</span>
          </div>
          <div role="tablist" aria-label="KIRA ecosystem products" onKeyDown={onKeyDown}>
            {NODES.map((n, index) => (
              <button
                key={n.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`${baseId}-node-${n.id}`}
                aria-selected={active === index}
                aria-controls={`${baseId}-panel`}
                tabIndex={active === index ? 0 : -1}
                className={`intel-node${active === index ? " active" : ""}`}
                style={{ left: `${(n.x / 520) * 100}%`, top: `${(n.y / 520) * 100}%` }}
                onClick={() => setActive(index)}
              >
                <ProductLogo product={n.logo} size={44} className="intel-node-logo" />
                <span>{n.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div
        className="intel-panel"
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-node-${node.id}`}
        tabIndex={0}
      >
        <div className="intel-panel-inner" key={node.id}>
          <div className="intel-panel-head">
            <StatusBadge status={node.status} />
            <strong>{node.name}</strong>
          </div>
          <p>{node.description}</p>
          <ActionLink className="text-link" href={node.cta.href}>{node.cta.label}</ActionLink>
        </div>
      </div>
    </div>
  );
}
