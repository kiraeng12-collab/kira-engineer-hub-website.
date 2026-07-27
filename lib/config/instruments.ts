/**
 * KIRA instrument catalog — default contract specifications for the priority
 * instruments.
 *
 * These are conservative, broker-neutral defaults (dataSource "kira-default").
 * Real brokers differ, so:
 *   - the UI lets a user override any field before calculating, and
 *   - the engine refuses to guess when a required field is missing, returning
 *     "Calculation Unavailable" instead of a wrong number.
 *
 * Each record's numeric fields are chosen so that the tick-value method and
 * the contract-size method agree: tickValue = contractSize × tickSize in the
 * instrument's profit currency.
 */

import type { InstrumentSpec } from "@/lib/lot-sizing-engine/types";

export const INSTRUMENTS_VERSION = "2026-07-27.1";

const VERIFIED = "2026-07-27";
const SOURCE = "kira-default";

function spec(
  partial: Omit<InstrumentSpec, "dataSource" | "lastVerified" | "specVersion" | "marginMethod">
): InstrumentSpec {
  return {
    ...partial,
    marginMethod: "notional_leverage",
    dataSource: SOURCE,
    lastVerified: VERIFIED,
    specVersion: INSTRUMENTS_VERSION,
  };
}

export const instrumentCatalog: InstrumentSpec[] = [
  // ---- Metals ----
  spec({
    symbol: "XAUUSD",
    displayName: "Gold",
    aliases: ["GOLD", "XAU/USD", "GOLDUSD"],
    assetClass: "metal",
    contractSize: 100,
    tickSize: 0.01,
    tickValue: 1,
    pipSize: 0.1,
    minLot: 0.01,
    maxLot: 50,
    volumeStep: 0.01,
    profitCurrency: "USD",
    marginCurrency: "USD",
  }),
  spec({
    symbol: "XAGUSD",
    displayName: "Silver",
    aliases: ["SILVER", "XAG/USD", "SILVERUSD"],
    assetClass: "metal",
    contractSize: 5000,
    tickSize: 0.001,
    tickValue: 5,
    pipSize: 0.01,
    minLot: 0.01,
    maxLot: 50,
    volumeStep: 0.01,
    profitCurrency: "USD",
    marginCurrency: "USD",
  }),

  // ---- Forex majors ----
  spec({
    symbol: "EURUSD",
    displayName: "Euro / US Dollar",
    aliases: ["EUR/USD"],
    assetClass: "forex",
    contractSize: 100000,
    tickSize: 0.00001,
    tickValue: 1,
    pipSize: 0.0001,
    minLot: 0.01,
    maxLot: 100,
    volumeStep: 0.01,
    profitCurrency: "USD",
    marginCurrency: "EUR",
  }),
  spec({
    symbol: "GBPUSD",
    displayName: "British Pound / US Dollar",
    aliases: ["GBP/USD"],
    assetClass: "forex",
    contractSize: 100000,
    tickSize: 0.00001,
    tickValue: 1,
    pipSize: 0.0001,
    minLot: 0.01,
    maxLot: 100,
    volumeStep: 0.01,
    profitCurrency: "USD",
    marginCurrency: "GBP",
  }),
  spec({
    symbol: "USDJPY",
    displayName: "US Dollar / Japanese Yen",
    aliases: ["USD/JPY"],
    assetClass: "forex",
    contractSize: 100000,
    tickSize: 0.001,
    tickValue: 100, // 100,000 × 0.001 = 100 JPY per tick
    pipSize: 0.01,
    minLot: 0.01,
    maxLot: 100,
    volumeStep: 0.01,
    profitCurrency: "JPY",
    marginCurrency: "USD",
  }),
  spec({
    symbol: "AUDUSD",
    displayName: "Australian Dollar / US Dollar",
    aliases: ["AUD/USD"],
    assetClass: "forex",
    contractSize: 100000,
    tickSize: 0.00001,
    tickValue: 1,
    pipSize: 0.0001,
    minLot: 0.01,
    maxLot: 100,
    volumeStep: 0.01,
    profitCurrency: "USD",
    marginCurrency: "AUD",
  }),
  spec({
    symbol: "USDCHF",
    displayName: "US Dollar / Swiss Franc",
    aliases: ["USD/CHF"],
    assetClass: "forex",
    contractSize: 100000,
    tickSize: 0.00001,
    tickValue: 1, // in CHF
    pipSize: 0.0001,
    minLot: 0.01,
    maxLot: 100,
    volumeStep: 0.01,
    profitCurrency: "CHF",
    marginCurrency: "USD",
  }),
  spec({
    symbol: "USDCAD",
    displayName: "US Dollar / Canadian Dollar",
    aliases: ["USD/CAD"],
    assetClass: "forex",
    contractSize: 100000,
    tickSize: 0.00001,
    tickValue: 1, // in CAD
    pipSize: 0.0001,
    minLot: 0.01,
    maxLot: 100,
    volumeStep: 0.01,
    profitCurrency: "CAD",
    marginCurrency: "USD",
  }),

  // ---- Stock indices (CFD; contractSize 1 => 1 index point = 1 unit of profit currency per lot) ----
  spec({
    symbol: "US30",
    displayName: "US 30 (Dow Jones)",
    aliases: ["DJ30", "DOW", "WALL STREET", "US30USD"],
    assetClass: "index",
    contractSize: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    pipSize: 1,
    minLot: 0.01,
    maxLot: 50,
    volumeStep: 0.01,
    profitCurrency: "USD",
    marginCurrency: "USD",
  }),
  spec({
    symbol: "US100",
    displayName: "US 100 (Nasdaq)",
    aliases: ["NAS100", "NASDAQ", "USTEC", "US100USD"],
    assetClass: "index",
    contractSize: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    pipSize: 1,
    minLot: 0.01,
    maxLot: 50,
    volumeStep: 0.01,
    profitCurrency: "USD",
    marginCurrency: "USD",
  }),
  spec({
    symbol: "US500",
    displayName: "US 500 (S&P 500)",
    aliases: ["SPX500", "SP500", "US500USD"],
    assetClass: "index",
    contractSize: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    pipSize: 1,
    minLot: 0.01,
    maxLot: 50,
    volumeStep: 0.01,
    profitCurrency: "USD",
    marginCurrency: "USD",
  }),
  spec({
    symbol: "GER40",
    displayName: "Germany 40 (DAX)",
    aliases: ["DE40", "DAX", "GER40EUR"],
    assetClass: "index",
    contractSize: 1,
    tickSize: 0.01,
    tickValue: 0.01, // in EUR
    pipSize: 1,
    minLot: 0.01,
    maxLot: 50,
    volumeStep: 0.01,
    profitCurrency: "EUR",
    marginCurrency: "EUR",
  }),
  spec({
    symbol: "UK100",
    displayName: "UK 100 (FTSE)",
    aliases: ["FTSE100", "UK100GBP"],
    assetClass: "index",
    contractSize: 1,
    tickSize: 0.1,
    tickValue: 0.1, // in GBP
    pipSize: 1,
    minLot: 0.01,
    maxLot: 50,
    volumeStep: 0.01,
    profitCurrency: "GBP",
    marginCurrency: "GBP",
  }),

  // ---- Crypto CFDs ----
  spec({
    symbol: "BTCUSD",
    displayName: "Bitcoin",
    aliases: ["BTC/USD", "BITCOIN", "XBTUSD"],
    assetClass: "crypto",
    contractSize: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    pipSize: 1,
    minLot: 0.01,
    maxLot: 10,
    volumeStep: 0.01,
    profitCurrency: "USD",
    marginCurrency: "USD",
  }),
  spec({
    symbol: "ETHUSD",
    displayName: "Ethereum",
    aliases: ["ETH/USD", "ETHEREUM"],
    assetClass: "crypto",
    contractSize: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    pipSize: 1,
    minLot: 0.01,
    maxLot: 50,
    volumeStep: 0.01,
    profitCurrency: "USD",
    marginCurrency: "USD",
  }),

  // ---- Energy CFDs ----
  spec({
    symbol: "USOIL",
    displayName: "US Crude Oil (WTI)",
    aliases: ["WTI", "CL", "OIL", "CRUDE", "USOILUSD"],
    assetClass: "energy",
    contractSize: 1000,
    tickSize: 0.01,
    tickValue: 10, // 1000 × 0.01
    pipSize: 0.01,
    minLot: 0.01,
    maxLot: 50,
    volumeStep: 0.01,
    profitCurrency: "USD",
    marginCurrency: "USD",
  }),
  spec({
    symbol: "UKOIL",
    displayName: "UK Crude Oil (Brent)",
    aliases: ["BRENT", "UKOILUSD"],
    assetClass: "energy",
    contractSize: 1000,
    tickSize: 0.01,
    tickValue: 10,
    pipSize: 0.01,
    minLot: 0.01,
    maxLot: 50,
    volumeStep: 0.01,
    profitCurrency: "USD",
    marginCurrency: "USD",
  }),
];

/** Case-insensitive lookup by symbol or any alias. Returns null if unknown. */
export function findInstrument(symbolOrAlias: string): InstrumentSpec | null {
  const needle = symbolOrAlias.trim().toUpperCase();
  if (!needle) return null;
  for (const inst of instrumentCatalog) {
    if (inst.symbol.toUpperCase() === needle) return inst;
    if (inst.aliases.some((a) => a.toUpperCase() === needle)) return inst;
  }
  return null;
}

/** Lightweight list for populating a picker, without the full spec detail. */
export function instrumentOptions(): { symbol: string; displayName: string; assetClass: string }[] {
  return instrumentCatalog.map((i) => ({
    symbol: i.symbol,
    displayName: i.displayName,
    assetClass: i.assetClass,
  }));
}
