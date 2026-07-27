/**
 * KIRA Lot Sizing Calculator — shared engine types.
 *
 * This module is framework-free and I/O-free on purpose: it is the pure core
 * that the website API, the Telegram Mini App API, and (later) Project 242 all
 * import. Nothing here may reach for a database, a request, or the network.
 *
 * Guiding principle enforced throughout the engine:
 *   Risk determines the position size. Leverage only determines whether
 *   sufficient margin is available.
 */

export type RiskModeId = "small" | "medium" | "big";

export type Direction = "BUY" | "SELL";

export type AssetClass =
  | "forex"
  | "metal"
  | "energy"
  | "index"
  | "crypto"
  | "stock"
  | "futures"
  | "other";

/**
 * How required margin is estimated for an instrument. For the MVP every
 * instrument uses the generic notional-÷-leverage method; the field exists so
 * broker-specific methods (fixed margin, tiered margin) can be added later
 * without changing calculation call sites.
 */
export type MarginMethod = "notional_leverage";

/** Access tier a value (risk mode, feature) is available to. */
export type AccessTier = "free" | "vip" | "all";

/**
 * A single instrument's contract specification. These vary per broker, so each
 * record carries provenance (`dataSource`, `lastVerified`, `specVersion`) and
 * the engine will refuse to guess when required fields are missing.
 */
export interface InstrumentSpec {
  /** Canonical broker-neutral symbol, e.g. "XAUUSD". */
  symbol: string;
  displayName: string;
  /** Alternative symbols brokers use for the same instrument, e.g. "GOLD". */
  aliases: string[];
  assetClass: AssetClass;
  /** Units of the base asset in one 1.00 lot (e.g. 100 oz for gold). */
  contractSize: number;
  /** Smallest price increment the instrument moves in. */
  tickSize: number;
  /**
   * Money value (in `profitCurrency`) of one `tickSize` move for a 1.00 lot.
   * This is the most reliable input for loss-per-lot; when present it is
   * preferred over the contract-size method.
   */
  tickValue: number;
  /** Human-facing pip size, for display only. */
  pipSize?: number;
  minLot: number;
  maxLot: number;
  /** Broker volume increment; final positions are floored to a multiple of it. */
  volumeStep: number;
  /** Currency the instrument's profit/loss is denominated in. */
  profitCurrency: string;
  /** Currency margin is denominated in. */
  marginCurrency: string;
  marginMethod?: MarginMethod;
  dataSource: string;
  /** ISO date the specification was last verified against a broker. */
  lastVerified: string;
  /** Bumped whenever any numeric field changes; stamped into each calculation. */
  specVersion: string;
}

/**
 * A KIRA risk mode. Values are configuration, not hard-coded constants, so an
 * administrator (via lib/config/risk-modes.ts) can tune them without touching
 * engine code.
 */
export interface RiskMode {
  id: RiskModeId;
  /** Display name, e.g. "Small — Protected". */
  name: string;
  description: string;
  /** Risk budget as a percent of equity, e.g. 0.25 means 0.25%. */
  riskPercent: number;
  /** Extreme-market buffer applied to the stop distance / per-lot loss. */
  stressMultiplier: number;
  /** Ceiling on required margin, as a percent of equity, e.g. 10 means 10%. */
  maxMarginUsagePercent: number;
  active: boolean;
  availableTo: AccessTier;
  version: string;
}

/** Everything the engine needs to size one position. */
export interface CalculationInput {
  /** Primary account value. Includes the effect of open P&L. */
  equity?: number;
  /** Fallback only, used when equity is not provided. */
  balance?: number;
  accountCurrency: string;
  leverage: number;

  /** Symbol or alias; resolved against the instrument catalog / override. */
  instrumentSymbol: string;
  direction: Direction;
  entryPrice: number;
  stopLossPrice: number;

  riskModeId: RiskModeId;

  // ---- Advanced / optional ----
  /**
   * User- or broker-supplied specification, merged over the catalog record.
   * When the catalog has no record, a complete override lets the calculation
   * proceed; otherwise the engine returns "Calculation Unavailable".
   */
  brokerSpecOverride?: Partial<InstrumentSpec> & { symbol?: string };
  freeMargin?: number;
  /** Split the recommended position across N planned entries (VIP). */
  numberOfEntries?: number;
  holdThroughNews?: boolean;
  holdOvernight?: boolean;
  holdOverWeekend?: boolean;

  /**
   * Conversion rate from the instrument's profit currency to the account
   * currency (profit → account). Required only when the two differ. When it is
   * needed and absent, the engine returns No Trade rather than guessing.
   */
  fxRate?: number;

  /** Access tier of the requester; gates VIP-only inputs. Defaults to "free". */
  access?: "free" | "vip";
}

export type CalculationStatus =
  | "within_parameters"
  | "caution"
  | "high_risk"
  | "no_trade";

/**
 * The full result of a calculation. Every field the result screen can show is
 * present; monetary amounts are in the account currency. `null` means "not
 * applicable" (typically a No Trade result).
 */
export interface CalculationResult {
  status: CalculationStatus;

  recommendedPosition: number | null;
  rawRiskPosition: number | null;
  stressAdjustedPosition: number | null;
  marginLimitedPosition: number | null;

  normalRiskAmount: number;
  stressTestedRiskAmount: number;

  normalStopDistance: number;
  stressedStopDistance: number;

  lossPerLotNormal: number | null;
  lossPerLotStressed: number | null;

  normalEstimatedLoss: number | null;
  stressTestedEstimatedLoss: number | null;

  requiredMargin: number | null;
  projectedMarginUsagePercent: number | null;
  riskPercentOfEquity: number | null;

  brokerMinLot: number;
  brokerMaxLot: number;
  brokerVolumeStep: number;

  /** Per-entry distribution when numberOfEntries > 1; else undefined. */
  entries?: number[];

  warnings: string[];
  assumptions: string[];
  rejectionReasons: string[];
  explanation: string;

  calculationVersion: string;
  timestamp: string;

  // ---- Echo of key inputs for the result screen ----
  riskModeId: RiskModeId;
  riskModeName: string;
  riskModeRiskPercent: number;
  stressMultiplier: number;
  instrumentSymbol: string;
  instrumentDisplayName: string;
  direction: Direction;
  entryPriceUsed: number;
  stopLossPrice: number;
  accountCurrency: string;
  equityUsed: number;
  leverage: number;
  instrumentSpecVersion: string;
}
