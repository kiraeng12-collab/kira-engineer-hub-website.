"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/config/site";
import { BrandLogo } from "@/components/BrandLogo";
import { TelegramLink } from "@/components/TelegramLink";
import { AnnouncementBar } from "./AnnouncementBar";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/ecosystem", label: "Ecosystem" },
  { href: "/membership", label: "Membership" },
  { href: "/project-242", label: "Project 242" },
  { href: "/insights", label: "Insights" },
  { href: "/about", label: "About" },
];

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  );
}

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const trapRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll(); // pages can load pre-scrolled (anchors, back-navigation)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);

    if (!open) return;

    const firstLink = menuRef.current?.querySelector("a");
    firstLink?.focus();

    function onKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !trapRootRef.current) return;

      const focusable = getFocusable(trapRootRef.current);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function onPointerDown(event: MouseEvent) {
      if (trapRootRef.current && !trapRootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeydown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  const previouslyOpen = useRef(false);
  useEffect(() => {
    if (previouslyOpen.current && !open) {
      menuButtonRef.current?.focus();
    }
    previouslyOpen.current = open;
  }, [open]);

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}`} data-header>
      <div className="market-teaser" aria-label="Trading slogan">
        <div className="container">
          <span className="candlestick-strip" aria-hidden="true">
            <span className="candle one" />
            <span className="candle red two" />
            <span className="candle three" />
            <span className="candle aqua four" />
            <span className="candle five" />
          </span>
          <strong>Grab the Bull&apos;s Horns</strong>
        </div>
      </div>
      <div className="container nav" ref={trapRootRef}>
        <button
          className="menu-button"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-controls="site-menu"
          aria-expanded={open}
          ref={menuButtonRef}
          onClick={() => setOpen((value) => !value)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <nav
          className={`nav-links${open ? " open" : ""}`}
          id="site-menu"
          aria-label="Main navigation"
          ref={menuRef}
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link className="brand" href="/" aria-label="Kira Engineer Hub home">
          <BrandLogo context="header" />
        </Link>
        <div className="nav-actions">
          <TelegramLink className="button secondary" href={siteConfig.social.telegramCommunity}>
            Join Free
          </TelegramLink>
          <Link className="button" href="/membership">
            Become a Member
          </Link>
          {session ? (
            <Link className="button secondary" href="/account">
              Account
            </Link>
          ) : null}
        </div>
      </div>
      <AnnouncementBar />
    </header>
  );
}
