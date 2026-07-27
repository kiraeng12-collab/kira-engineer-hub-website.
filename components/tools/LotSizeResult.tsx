"use client";

import type { CalculationResult } from "@/lib/lot-sizing-engine/types";

const STATUS_LABEL: Record<CalculationResult["status"], string> = {
  within_parameters: "Within Parameters",
  caution: "Caution",
  high_risk: "High Risk",
  no_trade: "No Trade",
};

function money(value: number | null, currency: string): string {
  if (value === null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function num(value: number | null, digits = 2): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

function pct(value: number | null): string {
  if (value === null) return "—";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)}%`;
}

/** Trims a lot value to a tidy string (0.02, 1.5, 3). */
function lots(value: number): string {
  return String(Number(value.toFixed(3)));
}

export function LotSizeResult({
  result,
  onCalculateAgain,
  onChangeRiskMode,
}: {
  result: CalculationResult;
  onCalculateAgain: () => void;
  onChangeRiskMode: () => void;
}) {
  const cur = result.accountCurrency || "USD";
  const isNoTrade = result.status === "no_trade";

  function copyResult() {
    const lines = isNoTrade
      ? [
          `KIRA Lot Sizing Calculator — No Safe Position Available`,
          `${result.instrumentSymbol} ${result.direction}`,
          ...result.rejectionReasons.map((r) => `• ${r}`),
        ]
      : [
          `KIRA Lot Sizing Calculator`,
          `${result.instrumentSymbol} ${result.direction} — ${result.riskModeName}`,
          `Recommended: ${lots(result.recommendedPosition ?? 0)} lots`,
          `Status: ${STATUS_LABEL[result.status]}`,
          `Planned risk: ${money(result.normalEstimatedLoss, cur)} (${pct(result.riskPercentOfEquity)} of equity)`,
          `Stress-tested loss: ${money(result.stressTestedEstimatedLoss, cur)}`,
          `Required margin: ${money(result.requiredMargin, cur)}`,
          ``,
          `This is an educational risk estimate. Actual losses may differ.`,
        ];
    void navigator.clipboard?.writeText(lines.join("\n"));
  }

  return (
    <div>
      <span className="lot-calc__status" data-tone={result.status}>
        {STATUS_LABEL[result.status]}
      </span>

      <div className="lot-calc__headline">
        {isNoTrade ? (
          <div className="lot-calc__no-trade-title">No Safe Position Available</div>
        ) : (
          <div>
            <span className="lot-calc__number">{lots(result.recommendedPosition ?? 0)}</span>
            <span className="lot-calc__number-unit">Lots</span>
          </div>
        )}
      </div>

      <p className="lot-calc__meta" style={{ marginTop: 4 }}>
        {result.instrumentDisplayName} ({result.instrumentSymbol}) · {result.direction} · {result.riskModeName}
      </p>

      {result.entries && result.entries.length > 1 && (
        <>
          <p className="lot-calc__section-label" style={{ marginTop: 14 }}>
            Split across {result.entries.length} entries
          </p>
          <div className="lot-calc__entries">
            {result.entries.map((e, i) => (
              <span key={i} className="lot-calc__entry-chip">
                {lots(e)}
              </span>
            ))}
          </div>
        </>
      )}

      {!isNoTrade && (
        <div className="lot-calc__kpis">
          <Kpi label="Risk budget" value={money(result.normalRiskAmount, cur)} />
          <Kpi label="Risk of equity" value={pct(result.riskPercentOfEquity)} />
          <Kpi label="Planned loss (normal)" value={money(result.normalEstimatedLoss, cur)} />
          <Kpi label="Stress-tested loss" value={money(result.stressTestedEstimatedLoss, cur)} />
          <Kpi label="Required margin" value={money(result.requiredMargin, cur)} />
          <Kpi label="Margin usage" value={pct(result.projectedMarginUsagePercent)} />
          <Kpi label="Normal stop distance" value={num(result.normalStopDistance, 5)} />
          <Kpi label={`Stressed distance (${num(result.stressMultiplier, 2)}×)`} value={num(result.stressedStopDistance, 5)} />
          <Kpi label="Broker min lot" value={num(result.brokerMinLot, 3)} />
          <Kpi label="Volume step" value={num(result.brokerVolumeStep, 3)} />
        </div>
      )}

      {result.explanation && <p className="lot-calc__explain">{result.explanation}</p>}

      {result.rejectionReasons.length > 0 && (
        <>
          <p className="lot-calc__section-label">Why no trade</p>
          <ul className="lot-calc__list" data-tone="reject">
            {result.rejectionReasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </>
      )}

      {result.warnings.length > 0 && (
        <>
          <p className="lot-calc__section-label">Warnings</p>
          <ul className="lot-calc__list" data-tone="warning">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </>
      )}

      {result.assumptions.length > 0 && (
        <>
          <p className="lot-calc__section-label">Assumptions</p>
          <ul className="lot-calc__list" data-tone="assumption">
            {result.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}

      <div className="lot-calc__actions">
        <button type="button" className="button secondary" onClick={copyResult}>
          Copy Result
        </button>
        <button type="button" className="button secondary" onClick={onChangeRiskMode}>
          Change Risk Mode
        </button>
        <button type="button" className="button cyan" onClick={onCalculateAgain}>
          Calculate Again
        </button>
      </div>

      <p className="lot-calc__meta">
        Calculation {result.calculationVersion} · specs {result.instrumentSpecVersion} · {new Date(result.timestamp).toLocaleString()}
      </p>

      <p className="lot-calc__disclaimer">
        This calculation is an educational risk estimate. Actual losses may differ because of slippage, price gaps,
        spread changes, broker execution, currency conversion, and market conditions. It is not financial advice.
      </p>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="lot-calc__kpi">
      <div className="lot-calc__kpi-label">{label}</div>
      <div className="lot-calc__kpi-value">{value}</div>
    </div>
  );
}
