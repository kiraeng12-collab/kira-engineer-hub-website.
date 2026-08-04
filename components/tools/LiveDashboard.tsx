"use client";

import { useEffect, useRef, useState } from "react";

type Trade = {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  size: string | null;
  entryMin: number | null;
  entryMax: number | null;
  stopLoss: number | null;
  originalStopLoss: number | null;
  movedToBE: boolean;
  takeProfits: number[];
  tpHitCount: number;
  status: string;
  outcome: string | null;
  openedAt: string;
  closedAt: string | null;
  calcUrl?: string | null;
};

type DashboardData = { running: Trade[]; closed: Trade[]; serverTime: string };

const REFRESH_MS = 20000;

function fmt(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 5 }).format(n);
}
function entryText(t: Trade): string {
  if (t.entryMin == null) return "—";
  if (t.entryMax != null && t.entryMax !== t.entryMin) return `${fmt(t.entryMin)}–${fmt(t.entryMax)}`;
  return fmt(t.entryMin);
}

export function LiveDashboard() {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<"loading" | "ok" | "locked" | "error">("loading");
  const [lockMsg, setLockMsg] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [viewer, setViewer] = useState<string>("");
  const [stamp, setStamp] = useState<string>("");
  const initData = useRef<string>("");

  // Telegram init: inject SDK, read initData, strip website chrome.
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
        initData.current = wa.initData || "";
        // Identity for the anti-leak watermark. Any screenshot then carries who
        // took it. Best-effort — falls back to a generic label if unavailable.
        const u = wa.initDataUnsafe?.user;
        if (u) {
          const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || "";
          setViewer([name, u.id ? `id ${u.id}` : ""].filter(Boolean).join(" · "));
        }
      }
      setReady(true);
    }
    if (window.Telegram?.WebApp) activate();
    else {
      const s = document.createElement("script");
      s.src = "https://telegram.org/js/telegram-web-app.js";
      s.async = true;
      s.onload = activate;
      s.onerror = () => setReady(true);
      document.head.appendChild(s);
    }
    return () => document.body.classList.remove("tg-miniapp");
  }, []);

  // Poll the dashboard once ready, then on an interval.
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/tools/dashboard", {
          headers: initData.current ? { "X-Telegram-Init-Data": initData.current } : {},
        });
        if (!alive) return;
        if (res.status === 401 || res.status === 403) {
          const b = await res.json().catch(() => ({}));
          setLockMsg(b.message || "This dashboard is for active KIRA VIP members.");
          setStatus("locked");
          return;
        }
        if (!res.ok) {
          setStatus("error");
          return;
        }
        setData((await res.json()) as DashboardData);
        setStatus("ok");
      } catch {
        if (alive) setStatus((s) => (s === "ok" ? "ok" : "error"));
      }
    }
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [ready]);

  // Live timestamp for the watermark, refreshed every 30s.
  useEffect(() => {
    const tick = () =>
      setStamp(
        new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
      );
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  if (!ready || status === "loading") {
    return <p className="dash__empty">Loading live trades…</p>;
  }

  if (status === "locked") {
    return (
      <div className="dash__lock">
        <div className="dash__lock-badge" aria-hidden="true">🔒</div>
        <h2>VIP members only</h2>
        <p>{lockMsg}</p>
        <a className="button cyan" href="https://www.kiraengineerhub.com/membership" target="_blank" rel="noopener noreferrer">
          Get VIP Access
        </a>
      </div>
    );
  }

  if (status === "error" || !data) {
    return <p className="dash__empty">Couldn’t load the dashboard. Please reopen it in a moment.</p>;
  }

  return (
    <div className="dash">
      <Watermark label={[viewer || "KIRA VIP", stamp].filter(Boolean).join("  ·  ")} />
      <section>
        <p className="dash__section-label">
          🟢 Running <span className="dash__count">{data.running.length}</span>
        </p>
        {data.running.length === 0 ? (
          <p className="dash__empty">No trades running right now. New setups appear here live.</p>
        ) : (
          <div className="dash__cards">
            {data.running.map((t) => (
              <RunningCard key={t.id} t={t} />
            ))}
          </div>
        )}
      </section>

      {data.closed.length > 0 && (
        <section>
          <p className="dash__section-label">✅ Recently closed</p>
          <ul className="dash__closed">
            {data.closed.map((t) => (
              <li key={t.id}>
                <span className="dash__closed-sym">
                  {t.symbol} <em data-dir={t.direction}>{t.direction}</em>
                </span>
                <span className="dash__outcome" data-outcome={t.outcome ?? "manual"}>
                  {t.outcome === "sl"
                    ? "SL hit"
                    : t.outcome === "cancelled"
                    ? "Cancelled"
                    : t.outcome?.startsWith("tp")
                    ? `${t.outcome.toUpperCase()} ✅`
                    : "Closed"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="dash__meta">
        Live · updates every {REFRESH_MS / 1000}s · reflects the KIRA VIP channel. Educational only, not financial advice.
      </p>
    </div>
  );
}

// A tiled, low-opacity identity overlay. Screenshots can't be blocked on a web
// Mini App, so instead every view is stamped with who is looking + when — a
// leaked screenshot then identifies the leaker. pointer-events:none so it never
// interferes with taps.
function Watermark({ label }: { label: string }) {
  const safe = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='380' height='210'>` +
    `<text x='8' y='105' transform='rotate(-28 190 105)' fill='rgba(150,163,180,0.13)' ` +
    `font-family='Arial, Helvetica, sans-serif' font-size='13' font-weight='700'>${safe}</text></svg>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        backgroundImage: url,
        backgroundRepeat: "repeat",
      }}
    />
  );
}

function RunningCard({ t }: { t: Trade }) {
  return (
    <div className="dash__card">
      <div className="dash__card-head">
        <span className="dash__sym">{t.symbol}</span>
        <span className="dash__dir" data-dir={t.direction}>{t.direction}</span>
        {t.size && <span className="dash__size">{t.size}</span>}
        <span className="dash__badges">
          {t.status === "pending" && <span className="dash__badge" data-tone="pending">Wait</span>}
          {t.movedToBE && <span className="dash__badge" data-tone="be">SL → BE</span>}
          {t.tpHitCount >= 1 && <span className="dash__badge" data-tone="tp">TP{t.tpHitCount} hit</span>}
        </span>
      </div>
      <div className="dash__rows">
        <div><span>Entry</span><b>{entryText(t)}</b></div>
        <div>
          <span>Stop</span>
          <b>
            {t.movedToBE && t.originalStopLoss != null ? (
              <>
                <s>{fmt(t.originalStopLoss)}</s> → {fmt(t.stopLoss)}
              </>
            ) : (
              fmt(t.stopLoss)
            )}
          </b>
        </div>
        {t.takeProfits.map((tp, i) => (
          <div key={i}>
            <span>TP{i + 1}</span>
            <b className={i < t.tpHitCount ? "dash__tp-hit" : ""}>{fmt(tp)}{i < t.tpHitCount ? " ✓" : ""}</b>
          </div>
        ))}
      </div>
      {t.calcUrl && (
        <a className="dash__calc" href={t.calcUrl}>
          📊 Calculate my lot
        </a>
      )}
    </div>
  );
}
