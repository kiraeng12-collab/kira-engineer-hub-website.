"use client";

import { useEffect, useState } from "react";
import { LotSizeCalculator } from "./LotSizeCalculator";

/** Minimal shape of the Telegram WebApp SDK surface we use. */
interface TelegramWebApp {
  initData: string;
  colorScheme: "light" | "dark";
  ready: () => void;
  expand: () => void;
  themeParams?: Record<string, string>;
}
declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

type Prefill = Parameters<typeof LotSizeCalculator>[0]["initialPrefill"];

/**
 * Runs the calculator as a Telegram Mini App. It loads the Telegram WebApp SDK,
 * reads the (already server-verifiable) `initData`, and passes it to the shared
 * calculator so its API calls authenticate as the Telegram user. Opened outside
 * Telegram, `initData` is empty and the calculator simply runs in free mode —
 * one shared UI, no separate calculation logic.
 */
export function TelegramMiniApp({
  prefill,
  signalNotice,
}: {
  prefill?: Prefill;
  signalNotice?: string | null;
}) {
  const [ready, setReady] = useState(false);
  const [initData, setInitData] = useState<string>("");

  useEffect(() => {
    document.body.classList.add("tg-miniapp");

    function activate() {
      const wa = window.Telegram?.WebApp;
      if (wa) {
        try {
          wa.ready();
          wa.expand();
        } catch {
          /* non-fatal */
        }
        setInitData(wa.initData || "");
      }
      setReady(true);
    }

    if (window.Telegram?.WebApp) {
      activate();
    } else {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-web-app.js";
      script.async = true;
      script.onload = activate;
      script.onerror = () => setReady(true); // still render in free mode
      document.head.appendChild(script);
    }

    return () => {
      document.body.classList.remove("tg-miniapp");
    };
  }, []);

  if (!ready) {
    return <p className="lot-calc__result-empty">Loading KIRA calculator…</p>;
  }

  return <LotSizeCalculator initData={initData || undefined} initialPrefill={prefill} signalNotice={signalNotice} />;
}
