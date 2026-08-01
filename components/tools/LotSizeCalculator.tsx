"use client";

import { useEffect, useRef, useState } from "react";
import type { CalculationResult } from "@/lib/lot-sizing-engine/types";
import { LotSizeResult } from "./LotSizeResult";

type Meta = {
  access: "free" | "vip";
  instruments: { symbol: string; displayName: string; assetClass: string }[];
  riskModes: {
    id: "small" | "medium" | "big";
    name: string;
    description: string;
    riskPercent: number;
    stressMultiplier: number;
    maxMarginUsagePercent: number;
  }[];
};

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "AED", "SAR"];
const LEVERAGES = [30, 50, 100, 200, 300, 400, 500, 1000];

type FormState = {
  equity: string;
  accountCurrency: string;
  leverage: string;
  instrumentSymbol: string;
  direction: "BUY" | "SELL";
  entryPrice: string;
  stopLossPrice: string;
  riskModeId: "small" | "medium" | "big";
  fxRate: string;
  numberOfEntries: string;
  holdThroughNews: boolean;
  holdOvernight: boolean;
  holdOverWeekend: boolean;
};

const INITIAL: FormState = {
  equity: "",
  accountCurrency: "USD",
  leverage: "100",
  instrumentSymbol: "XAUUSD",
  direction: "BUY",
  entryPrice: "",
  stopLossPrice: "",
  riskModeId: "medium",
  fxRate: "",
  numberOfEntries: "1",
  holdThroughNews: false,
  holdOvernight: false,
  holdOverWeekend: false,
};

type Profile = {
  id: string;
  label: string;
  accountCurrency: string;
  leverage: number;
  defaultEquity: number | null;
  defaultRiskMode: string | null;
};

type HistoryRow = {
  id: string;
  createdAt: string;
  status: CalculationResult["status"];
  riskMode: string;
  instrumentSymbol: string;
  direction: string;
  accountCurrency: string;
  recommendedPosition: number | null;
};

export function LotSizeCalculator({
  initialPrefill,
  initData,
  signalNotice,
}: {
  initialPrefill?: Partial<FormState>;
  /** Verified Telegram Mini App initData; when present it authenticates fetches. */
  initData?: string;
  /** Shown when a prefilled signal may have changed since the link was created. */
  signalNotice?: string | null;
}) {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [form, setForm] = useState<FormState>({ ...INITIAL, ...initialPrefill });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const modeRef = useRef<HTMLDivElement>(null);

  const isVip = meta?.access === "vip";

  // Fetch wrapper that attaches the Telegram identity header when running as a
  // Mini App, so the same routes authenticate both browser and Telegram users.
  const apiFetch = useRef((url: string, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (initData) headers.set("X-Telegram-Init-Data", initData);
    return fetch(url, { ...init, headers });
  });

  const loadVipData = useRef(() => {});
  loadVipData.current = () => {
    apiFetch.current("/api/tools/lot-size/profiles")
      .then((r) => (r.ok ? r.json() : { profiles: [] }))
      .then((d) => setProfiles(d.profiles ?? []))
      .catch(() => {});
    apiFetch.current("/api/tools/lot-size/history")
      .then((r) => (r.ok ? r.json() : { history: [] }))
      .then((d) => setHistory(d.history ?? []))
      .catch(() => {});
  };

  useEffect(() => {
    let active = true;
    apiFetch.current("/api/tools/lot-size")
      .then((r) => r.json())
      .then((data: Meta) => {
        if (!active) return;
        setMeta(data);
        if (data.access === "vip") loadVipData.current();
      })
      .catch(() => {
        /* metadata is non-critical; the form still works with fallbacks */
      });
    return () => {
      active = false;
    };
  }, []);

  function applyProfile(id: string) {
    const p = profiles.find((x) => x.id === id);
    if (!p) return;
    setForm((f) => ({
      ...f,
      accountCurrency: p.accountCurrency,
      leverage: String(p.leverage),
      equity: p.defaultEquity != null ? String(p.defaultEquity) : f.equity,
      riskModeId: (p.defaultRiskMode as FormState["riskModeId"]) ?? f.riskModeId,
    }));
  }

  async function saveProfile() {
    const label = window.prompt("Name this account profile (e.g. \"Exness $10k\")");
    if (!label) return;
    const res = await apiFetch.current("/api/tools/lot-size/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        accountCurrency: form.accountCurrency,
        leverage: form.leverage,
        defaultEquity: form.equity || undefined,
        defaultRiskMode: form.riskModeId,
      }),
    });
    if (res.ok) loadVipData.current();
  }

  async function removeProfile(id: string) {
    const res = await apiFetch.current(`/api/tools/lot-size/profiles/${id}`, { method: "DELETE" });
    if (res.ok) setProfiles((ps) => ps.filter((p) => p.id !== id));
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrors([]);

    try {
      const res = await apiFetch.current("/api/tools/lot-size", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equity: form.equity,
          accountCurrency: form.accountCurrency,
          leverage: form.leverage,
          instrumentSymbol: form.instrumentSymbol,
          direction: form.direction,
          entryPrice: form.entryPrice,
          stopLossPrice: form.stopLossPrice,
          riskModeId: form.riskModeId,
          fxRate: form.fxRate || undefined,
          numberOfEntries: form.numberOfEntries,
          holdThroughNews: form.holdThroughNews,
          holdOvernight: form.holdOvernight,
          holdOverWeekend: form.holdOverWeekend,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrors(data.errors ?? [data.message ?? "The calculation could not be completed."]);
        return;
      }
      setResult(data.result as CalculationResult);
      setStatus("done");
      if (meta?.access === "vip") loadVipData.current(); // refresh history
    } catch {
      setStatus("error");
      setErrors(["Network error. Please try again."]);
    }
  }

  const riskModes = meta?.riskModes ?? [];
  const instruments = meta?.instruments ?? [{ symbol: "XAUUSD", displayName: "Gold", assetClass: "metal" }];

  // Gate: the calculator is VIP-only. Wait for metadata (which carries the
  // server-resolved access tier) before deciding, so non-VIP never see the form.
  if (meta === null) {
    return <p className="lot-calc__result-empty">Loading KIRA calculator…</p>;
  }
  if (meta.access !== "vip") {
    return (
      <div className="lot-calc__lock">
        <div className="lot-calc__lock-badge" aria-hidden="true">🔒</div>
        <h2>VIP members only</h2>
        <p>
          The KIRA Lot Sizing Calculator is an exclusive tool for KIRA VIP members. Join the VIP community to unlock
          risk-first position sizing, stress-tested lots, saved accounts, and signal-linked calculations.
        </p>
        <a className="button cyan" href="https://www.kiraengineerhub.com/membership" target="_blank" rel="noopener noreferrer">
          Get VIP Access
        </a>
        <p className="lot-calc__lock-note">
          Already a VIP? Open this from inside the KIRA VIP bot while your Telegram account is a member of the VIP
          group, so we can verify your access.
        </p>
      </div>
    );
  }

  return (
    <div className="lot-calc__panels">
      {/* ---- Input panel ---- */}
      <div className="lot-calc__panel">
        <h2>Your trade</h2>

        {signalNotice && (
          <p className="lot-calc__signal-notice" role="status">
            {signalNotice}
          </p>
        )}

        {isVip && (
          <div className="lot-calc__vip-bar">
            <select
              aria-label="Load a saved account profile"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) applyProfile(e.target.value);
              }}
            >
              <option value="">
                {profiles.length ? "Load saved account…" : "No saved accounts yet"}
              </option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} · {p.accountCurrency} · 1:{p.leverage}
                </option>
              ))}
            </select>
            <button type="button" className="button secondary" onClick={saveProfile}>
              Save account
            </button>
          </div>
        )}
        {isVip && profiles.length > 0 && (
          <div className="lot-calc__profile-chips">
            {profiles.map((p) => (
              <span key={p.id} className="lot-calc__profile-chip">
                {p.label}
                <button type="button" aria-label={`Delete ${p.label}`} onClick={() => removeProfile(p.id)}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="lot-calc__grid">
            <label className="field">
              Account equity
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                required
                value={form.equity}
                onChange={(e) => set("equity", e.target.value)}
                placeholder="10000"
              />
              <small>Includes open profit/loss. Use balance only if equity is unavailable.</small>
            </label>

            <label className="field">
              Account currency
              <select value={form.accountCurrency} onChange={(e) => set("accountCurrency", e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Leverage (1:x)
              <select value={form.leverage} onChange={(e) => set("leverage", e.target.value)}>
                {LEVERAGES.map((l) => (
                  <option key={l} value={l}>
                    1:{l}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Instrument
              <select value={form.instrumentSymbol} onChange={(e) => set("instrumentSymbol", e.target.value)}>
                {instruments.map((i) => (
                  <option key={i.symbol} value={i.symbol}>
                    {i.displayName} ({i.symbol})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Direction
              <select value={form.direction} onChange={(e) => set("direction", e.target.value as "BUY" | "SELL")}>
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </label>

            <label className="field">
              Entry price
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                value={form.entryPrice}
                onChange={(e) => set("entryPrice", e.target.value)}
              />
            </label>

            <label className="field">
              Stop-loss price
              <input
                type="number"
                inputMode="decimal"
                step="any"
                required
                value={form.stopLossPrice}
                onChange={(e) => set("stopLossPrice", e.target.value)}
              />
              <small>Buy: below entry · Sell: above entry.</small>
            </label>
          </div>

          {/* Risk mode */}
          <p className="lot-calc__section-label" style={{ marginTop: 18 }}>
            KIRA risk mode
          </p>
          <div className="lot-calc__modes" ref={modeRef}>
            {(riskModes.length
              ? riskModes
              : [
                  { id: "small", name: "Small — Protected", riskPercent: 0.25, description: "" },
                  { id: "medium", name: "Medium — Balanced", riskPercent: 0.5, description: "" },
                  { id: "big", name: "Big — Controlled", riskPercent: 1.0, description: "" },
                ]
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                className="lot-calc__mode"
                aria-pressed={form.riskModeId === m.id}
                onClick={() => set("riskModeId", m.id as FormState["riskModeId"])}
              >
                <div className="lot-calc__mode-name">{m.name.split("—")[0].trim()}</div>
                <div className="lot-calc__mode-risk">{m.riskPercent}% risk</div>
                <div className="lot-calc__mode-desc">{"description" in m ? m.description : ""}</div>
              </button>
            ))}
          </div>

          {/* Advanced */}
          <div style={{ marginTop: 16 }}>
            <button type="button" className="lot-calc__toggle-adv" onClick={() => setShowAdvanced((s) => !s)}>
              {showAdvanced ? "− Hide advanced settings" : "+ Advanced settings"}
            </button>
          </div>

          {showAdvanced && (
            <div className="lot-calc__advanced">
              <div className="lot-calc__grid">
                <label className="field">
                  FX rate (profit → account)
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={form.fxRate}
                    onChange={(e) => set("fxRate", e.target.value)}
                    placeholder="only if currencies differ"
                  />
                  <small>Needed when the instrument settles in a different currency than your account.</small>
                </label>

                {isVip && (
                  <label className="field">
                    Number of entries (VIP)
                    <input
                      type="number"
                      min="1"
                      max="10"
                      step="1"
                      value={form.numberOfEntries}
                      onChange={(e) => set("numberOfEntries", e.target.value)}
                    />
                  </label>
                )}
              </div>

              <div className="lot-calc__checks">
                <label className="lot-calc__check">
                  <input
                    type="checkbox"
                    checked={form.holdThroughNews}
                    onChange={(e) => set("holdThroughNews", e.target.checked)}
                  />
                  Hold through major news
                </label>
                <label className="lot-calc__check">
                  <input
                    type="checkbox"
                    checked={form.holdOvernight}
                    onChange={(e) => set("holdOvernight", e.target.checked)}
                  />
                  Hold overnight
                </label>
                <label className="lot-calc__check">
                  <input
                    type="checkbox"
                    checked={form.holdOverWeekend}
                    onChange={(e) => set("holdOverWeekend", e.target.checked)}
                  />
                  Hold over the weekend
                </label>
              </div>
            </div>
          )}

          <button type="submit" className="button cyan lot-calc__submit" disabled={status === "loading"}>
            {status === "loading" ? "Calculating…" : "Calculate My Lot Size"}
          </button>

          {status === "error" && errors.length > 0 && (
            <div className="lot-calc__error" aria-live="polite">
              {errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* ---- Result panel ---- */}
      <div className="lot-calc__panel" aria-live="polite">
        <h2>Result</h2>
        {result ? (
          <LotSizeResult
            result={result}
            onCalculateAgain={() => {
              setResult(null);
              setStatus("idle");
            }}
            onChangeRiskMode={() => {
              setResult(null);
              setStatus("idle");
              modeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
        ) : (
          <p className="lot-calc__result-empty">
            Enter your account and trade details, then press <strong>Calculate My Lot Size</strong>. KIRA sizes the
            position from the risk you can responsibly take — never from leverage alone.
          </p>
        )}

        {isVip && history.length > 0 && (
          <div className="lot-calc__history">
            <p className="lot-calc__section-label">Recent calculations</p>
            <ul className="lot-calc__history-list">
              {history.slice(0, 8).map((h) => (
                <li key={h.id}>
                  <span className="lot-calc__history-inst">
                    {h.instrumentSymbol} {h.direction}
                  </span>
                  <span className="lot-calc__history-pos">
                    {h.recommendedPosition != null ? `${Number(h.recommendedPosition.toFixed(3))} lots` : "No trade"}
                  </span>
                  <span className="lot-calc__status" data-tone={h.status} style={{ padding: "2px 8px", fontSize: "0.66rem" }}>
                    {h.status.replace(/_/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
