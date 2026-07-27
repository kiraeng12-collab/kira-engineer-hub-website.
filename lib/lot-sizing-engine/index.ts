/**
 * KIRA Lot Sizing Calculator — engine entry point.
 *
 *   calculateKiraLotSize(input): CalculationResult
 *
 * Pure and side-effect-free: no DB, no network, no clock beyond the timestamp
 * it stamps. This is the shared core for the website API, the Telegram Mini App
 * API, and later Project 242.
 *
 * The whole flow enforces one rule — risk sizes the position; leverage only
 * checks margin — and it can always answer "No Safe Position Available" rather
 * than forcing a number.
 */

import type {
  CalculationInput,
  CalculationResult,
  CalculationStatus,
  InstrumentSpec,
  RiskMode,
} from "./types";
import { validateInput } from "./validation";
import { resolveInstrumentSpec } from "./instrument-specs";
import { resolveFxFactor } from "./currency-conversion";
import { riskAmount, stopDistance, lossPerLotInProfitCurrency, rawPosition } from "./calculations";
import { marginPerLotInProfitCurrency, marginLimitedPosition } from "./margin";
import { roundDownToStep, Decimal } from "./rounding";
import { getRiskMode, engineConfig } from "@/lib/config/risk-modes";

const STATUS_RANK: Record<CalculationStatus, number> = {
  within_parameters: 0,
  caution: 1,
  high_risk: 2,
  no_trade: 3,
};

function escalate(current: CalculationStatus, next: CalculationStatus): CalculationStatus {
  return STATUS_RANK[next] > STATUS_RANK[current] ? next : current;
}

function num(d: Decimal): number {
  return d.toNumber();
}

export function calculateKiraLotSize(input: CalculationInput): CalculationResult {
  const timestamp = new Date().toISOString();
  const version = engineConfig.calculationVersion;

  // ---- 1. Validate inputs ----
  const validation = validateInput(input);
  const mode: RiskMode | undefined = getRiskMode(input.riskModeId);

  if (!validation.ok) {
    return noTradeShell(input, timestamp, version, mode, {
      rejectionReasons: validation.errors.map((e) => e.message),
      explanation:
        "The calculation cannot run because some inputs are missing or invalid. Please correct the highlighted fields and try again.",
    });
  }
  const equity = new Decimal(validation.equity);

  // ---- 2. Resolve instrument specification ----
  const specResult = resolveInstrumentSpec(input);
  if (!specResult.ok) {
    return noTradeShell(input, timestamp, version, mode, {
      rejectionReasons: [specResult.reason],
      explanation:
        "The broker contract specifications for this instrument could not be verified, so no position can be recommended. Enter the specifications under Advanced Settings to continue.",
    });
  }
  const spec = specResult.spec;

  const assumptions: string[] = [];
  const warnings: string[] = [];
  if (spec.dataSource.includes("kira-default")) {
    assumptions.push(
      `Using KIRA default specifications for ${spec.symbol} (last reviewed ${spec.lastVerified}). Confirm contract size, tick value, and lot limits against your broker.`
    );
  }
  if (specResult.usedOverride) {
    warnings.push("Specifications you entered have not been independently verified.");
  }

  // ---- 3. Currency conversion for loss (profit currency -> account currency) ----
  const fxLoss = resolveFxFactor(spec.profitCurrency, input.accountCurrency, input.fxRate);
  if (!fxLoss.ok) {
    return noTradeShell(input, timestamp, version, mode, {
      spec,
      rejectionReasons: [
        `A currency conversion rate from ${fxLoss.from} to ${fxLoss.to} is required for this instrument and was not supplied.`,
      ],
      explanation:
        `This instrument settles in ${spec.profitCurrency}, which differs from your account currency (${input.accountCurrency}). Provide the conversion rate under Advanced Settings so the risk can be measured accurately. The calculator will not guess a rate.`,
    });
  }
  const fxFactor = fxLoss.factor;

  // ---- 4. Risk budget and distances ----
  const riskBudget = riskAmount(equity, mode.riskPercent);
  const normalDist = stopDistance(input.entryPrice, input.stopLossPrice);
  const stressMult = new Decimal(mode.stressMultiplier);
  const stressedDist = normalDist.times(stressMult);

  // ---- 5. Loss per lot (account currency), normal and stressed ----
  const lossPerLotNormalAccount = lossPerLotInProfitCurrency(normalDist, spec).times(fxFactor);
  const lossPerLotStressedAccount = lossPerLotNormalAccount.times(stressMult);

  if (lossPerLotNormalAccount.lte(0)) {
    return noTradeShell(input, timestamp, version, mode, {
      spec,
      rejectionReasons: ["The stop-loss distance produces no measurable per-lot loss. Check your prices and specifications."],
      explanation: "The stop distance and instrument specification did not yield a usable per-lot loss, so no position can be sized.",
    });
  }

  const rawRiskPosition = rawPosition(riskBudget, lossPerLotNormalAccount);
  const stressPosition = rawPosition(riskBudget, lossPerLotStressedAccount);

  // ---- 6. Margin check (leverage used HERE only) ----
  // Notional is computed in the profit currency and converted to the account
  // currency with the same FX factor as the loss leg, so margin is always
  // estimable without a second rate.
  const marginPerLotAccount = marginPerLotInProfitCurrency(spec, input.entryPrice, input.leverage).times(fxFactor);
  const maxMarginAccount = equity.times(new Decimal(mode.maxMarginUsagePercent).div(100));
  const marginLimited: Decimal | null = marginPerLotAccount.gt(0)
    ? marginLimitedPosition(maxMarginAccount, marginPerLotAccount)
    : null;

  // ---- 7. Final position = min(stress, margin, brokerMax, productMax), floored ----
  const brokerMax = new Decimal(spec.maxLot);
  const productMax = new Decimal(engineConfig.productMaxLot);

  const candidates: { label: string; value: Decimal }[] = [
    { label: "risk", value: stressPosition },
    { label: "brokerMax", value: brokerMax },
    { label: "productMax", value: productMax },
  ];
  if (marginLimited) candidates.push({ label: "margin", value: marginLimited });

  let binding = candidates[0];
  for (const c of candidates) if (c.value.lt(binding.value)) binding = c;
  const finalRaw = binding.value;
  const finalRounded = roundDownToStep(finalRaw, spec.volumeStep);

  const minLot = new Decimal(spec.minLot);

  // ---- 8. No Trade when the floored position is below the broker minimum ----
  if (finalRounded.lt(minLot) || finalRounded.lte(0)) {
    const marginBound = binding.label === "margin";
    const rejection = marginBound
      ? "The margin ceiling for this risk mode would be exceeded before a tradeable position is reached."
      : "The broker's minimum position size would exceed the selected KIRA risk limit for this account and stop-loss distance.";
    return noTradeShell(input, timestamp, version, mode, {
      spec,
      assumptions,
      warnings,
      rejectionReasons: [rejection],
      normalStopDistance: num(normalDist),
      stressedStopDistance: num(stressedDist),
      normalRiskAmount: num(riskBudget),
      lossPerLotNormal: num(lossPerLotNormalAccount),
      lossPerLotStressed: num(lossPerLotStressedAccount),
      explanation:
        "The minimum position permitted by the broker may lose more than the amount allowed under your selected risk mode. The calculator therefore cannot recommend this trade under the current settings.",
    });
  }

  // ---- 9. Realised figures at the recommended position ----
  const normalEstimatedLoss = finalRounded.times(lossPerLotNormalAccount);
  const stressEstimatedLoss = finalRounded.times(lossPerLotStressedAccount);
  const riskPercentOfEquity = normalEstimatedLoss.div(equity).times(100);

  const requiredMargin = finalRounded.times(marginPerLotAccount);
  const projectedMarginUsage = requiredMargin.div(equity).times(100);

  // ---- 10. Status & warnings ----
  let status: CalculationStatus = "within_parameters";

  if (binding.label === "margin") {
    status = escalate(status, "caution");
    warnings.push(
      "This position is limited by your margin ceiling rather than by risk. A wider stop or more equity would allow the full risk-based size."
    );
  }

  if (input.holdThroughNews) {
    status = escalate(status, "caution");
    warnings.push("Holding through major news increases the chance of slippage beyond the stress buffer.");
  }
  if (input.holdOverWeekend) {
    status = escalate(status, "caution");
    warnings.push("Holding over the weekend exposes the position to opening gaps that a stop-loss cannot prevent.");
  }
  if (input.holdOvernight) {
    warnings.push("Holding overnight may incur swap charges and gap risk.");
    status = escalate(status, "caution");
  }

  // Broker minimum close to the risk budget (at the stressed distance).
  const lossAtMinStressed = minLot.times(lossPerLotStressedAccount);
  if (lossAtMinStressed.gte(riskBudget.times(engineConfig.brokerMinRiskCautionRatio))) {
    status = escalate(status, "caution");
    warnings.push("The broker's minimum lot is close to the selected risk limit for this stop distance.");
  }

  // Margin-usage pressure relative to the mode's ceiling.
  if (mode.maxMarginUsagePercent > 0) {
    const ratio = projectedMarginUsage.div(mode.maxMarginUsagePercent);
    if (ratio.gte(engineConfig.marginUsageHighRatio)) {
      status = escalate(status, "high_risk");
      warnings.push("Projected margin usage is very close to the configured ceiling for this mode.");
    } else if (ratio.gte(engineConfig.marginUsageCautionRatio)) {
      status = escalate(status, "caution");
      warnings.push("Projected margin usage is elevated for this mode.");
    }
  }

  // Big mode on a small account.
  if (mode.id === "big" && equity.lt(engineConfig.smallAccountEquityThreshold)) {
    status = escalate(status, "high_risk");
    warnings.push(
      `Big mode on an account under ${engineConfig.smallAccountEquityThreshold} ${input.accountCurrency} carries elevated risk. Consider Small or Medium.`
    );
  }

  // ---- 11. Multiple-entry distribution (VIP) ----
  let entries: number[] | undefined;
  if (input.numberOfEntries && input.numberOfEntries > 1) {
    entries = distributeEntries(finalRounded, spec, input.numberOfEntries, warnings);
  }

  // ---- 12. Explanation ----
  const explanation = buildExplanation({
    equity,
    accountCurrency: input.accountCurrency,
    mode,
    riskBudget,
    finalRounded,
    lotsUnit: spec.assetClass,
    stressMult,
  });

  return {
    status,
    recommendedPosition: num(finalRounded),
    rawRiskPosition: num(rawRiskPosition),
    stressAdjustedPosition: num(stressPosition),
    marginLimitedPosition: marginLimited ? num(marginLimited) : null,
    normalRiskAmount: num(riskBudget),
    stressTestedRiskAmount: num(stressEstimatedLoss),
    normalStopDistance: num(normalDist),
    stressedStopDistance: num(stressedDist),
    lossPerLotNormal: num(lossPerLotNormalAccount),
    lossPerLotStressed: num(lossPerLotStressedAccount),
    normalEstimatedLoss: num(normalEstimatedLoss),
    stressTestedEstimatedLoss: num(stressEstimatedLoss),
    requiredMargin: num(requiredMargin),
    projectedMarginUsagePercent: num(projectedMarginUsage),
    riskPercentOfEquity: num(riskPercentOfEquity),
    brokerMinLot: spec.minLot,
    brokerMaxLot: spec.maxLot,
    brokerVolumeStep: spec.volumeStep,
    entries,
    warnings,
    assumptions,
    rejectionReasons: [],
    explanation,
    calculationVersion: version,
    timestamp,
    riskModeId: mode.id,
    riskModeName: mode.name,
    riskModeRiskPercent: mode.riskPercent,
    stressMultiplier: mode.stressMultiplier,
    instrumentSymbol: spec.symbol,
    instrumentDisplayName: spec.displayName,
    direction: input.direction,
    entryPriceUsed: input.entryPrice,
    stopLossPrice: input.stopLossPrice,
    accountCurrency: input.accountCurrency.toUpperCase(),
    equityUsed: num(equity),
    leverage: input.leverage,
    instrumentSpecVersion: spec.specVersion,
  };
}

/**
 * Splits `total` lots across `requested` entries in whole volume steps, so the
 * sum never exceeds `total` and each entry is at least the broker minimum. If
 * the position cannot support that many entries, fewer are returned and a
 * warning is added.
 */
function distributeEntries(
  total: Decimal,
  spec: InstrumentSpec,
  requested: number,
  warnings: string[]
): number[] {
  const step = new Decimal(spec.volumeStep);
  const totalSteps = total.div(step).round();
  const minSteps = new Decimal(spec.minLot).div(step).round();

  const maxEntries = minSteps.lte(0)
    ? requested
    : Math.max(1, Math.min(requested, totalSteps.div(minSteps).floor().toNumber()));

  if (maxEntries < requested) {
    warnings.push(
      `The position cannot be split into ${requested} entries at the broker minimum; showing ${maxEntries} instead.`
    );
  }

  const base = totalSteps.div(maxEntries).floor();
  let extra = totalSteps.minus(base.times(maxEntries)).toNumber();

  const result: number[] = [];
  for (let i = 0; i < maxEntries; i++) {
    const stepsForEntry = base.plus(extra > 0 ? 1 : 0);
    if (extra > 0) extra--;
    result.push(num(stepsForEntry.times(step)));
  }
  return result;
}

function buildExplanation(args: {
  equity: Decimal;
  accountCurrency: string;
  mode: RiskMode;
  riskBudget: Decimal;
  finalRounded: Decimal;
  lotsUnit: string;
  stressMult: Decimal;
}): string {
  const cur = args.accountCurrency.toUpperCase();
  const equityStr = args.equity.toDecimalPlaces(2).toString();
  const budgetStr = args.riskBudget.toDecimalPlaces(2).toString();
  const posStr = args.finalRounded.toString();
  return (
    `Your account equity is ${equityStr} ${cur} and you selected ${args.mode.name}, ` +
    `which uses a starting risk of ${args.mode.riskPercent}%. This creates a risk budget of approximately ` +
    `${budgetStr} ${cur}. Based on the distance between your entry and stop-loss, the instrument specifications, ` +
    `and a ${args.stressMult.toString()}× extreme-market stress buffer, the recommended position is ${posStr} lots. ` +
    `This is an educational risk estimate; actual losses may differ.`
  );
}

/**
 * Builds a complete No Trade / Calculation Unavailable result. Optional
 * overrides let earlier-stage failures (validation, spec, FX) fill in whatever
 * they had computed so far.
 */
function noTradeShell(
  input: CalculationInput,
  timestamp: string,
  version: string,
  mode: RiskMode | undefined,
  overrides: Partial<CalculationResult> & { spec?: InstrumentSpec }
): CalculationResult {
  const spec = overrides.spec;
  const equityNum =
    typeof input.equity === "number" && Number.isFinite(input.equity)
      ? input.equity
      : typeof input.balance === "number" && Number.isFinite(input.balance)
        ? input.balance
        : 0;

  return {
    status: "no_trade",
    recommendedPosition: null,
    rawRiskPosition: null,
    stressAdjustedPosition: null,
    marginLimitedPosition: null,
    normalRiskAmount: overrides.normalRiskAmount ?? 0,
    stressTestedRiskAmount: overrides.stressTestedRiskAmount ?? 0,
    normalStopDistance: overrides.normalStopDistance ?? 0,
    stressedStopDistance: overrides.stressedStopDistance ?? 0,
    lossPerLotNormal: overrides.lossPerLotNormal ?? null,
    lossPerLotStressed: overrides.lossPerLotStressed ?? null,
    normalEstimatedLoss: null,
    stressTestedEstimatedLoss: null,
    requiredMargin: null,
    projectedMarginUsagePercent: null,
    riskPercentOfEquity: null,
    brokerMinLot: spec?.minLot ?? 0,
    brokerMaxLot: spec?.maxLot ?? 0,
    brokerVolumeStep: spec?.volumeStep ?? 0,
    warnings: overrides.warnings ?? [],
    assumptions: overrides.assumptions ?? [],
    rejectionReasons: overrides.rejectionReasons ?? ["Calculation unavailable."],
    explanation: overrides.explanation ?? "No position can be recommended under the current settings.",
    calculationVersion: version,
    timestamp,
    riskModeId: input.riskModeId,
    riskModeName: mode?.name ?? "Unknown",
    riskModeRiskPercent: mode?.riskPercent ?? 0,
    stressMultiplier: mode?.stressMultiplier ?? 0,
    instrumentSymbol: spec?.symbol ?? input.instrumentSymbol,
    instrumentDisplayName: spec?.displayName ?? input.instrumentSymbol,
    direction: input.direction,
    entryPriceUsed: input.entryPrice,
    stopLossPrice: input.stopLossPrice,
    accountCurrency: (input.accountCurrency ?? "").toUpperCase(),
    equityUsed: equityNum,
    leverage: input.leverage,
    instrumentSpecVersion: spec?.specVersion ?? "unknown",
  };
}

export type { CalculationInput, CalculationResult, CalculationStatus } from "./types";
export { calculateKiraLotSize as default };
