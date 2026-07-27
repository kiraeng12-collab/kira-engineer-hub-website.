/**
 * Input validation for the calculation engine. These checks reject inputs that
 * cannot produce a trustworthy result BEFORE any sizing math runs, so the
 * engine never returns a plausible-looking number from nonsense.
 *
 * Stop-loss *direction* is validated but returned as a distinct, hard error:
 * a Buy with the stop above entry (or a Sell with it below) is almost always a
 * data-entry mistake, and sizing it would understate the real risk.
 */

import type { CalculationInput } from "./types";
import { isRiskModeId } from "@/lib/config/risk-modes";

export type ValidationError = { field: string; message: string };

export type ValidationResult =
  | { ok: true; equity: number }
  | { ok: false; errors: ValidationError[] };

function isPositiveFinite(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

export function validateInput(input: CalculationInput): ValidationResult {
  const errors: ValidationError[] = [];

  // Equity is primary; balance is only a fallback.
  const equity = isPositiveFinite(input.equity)
    ? input.equity
    : isPositiveFinite(input.balance)
      ? input.balance!
      : NaN;
  if (!Number.isFinite(equity)) {
    errors.push({ field: "equity", message: "Enter a positive account equity (or balance)." });
  }

  if (!input.accountCurrency || !/^[A-Za-z]{3}$/.test(input.accountCurrency.trim())) {
    errors.push({ field: "accountCurrency", message: "Select a valid 3-letter account currency." });
  }

  if (!isPositiveFinite(input.leverage)) {
    errors.push({ field: "leverage", message: "Enter a valid account leverage." });
  }

  if (input.direction !== "BUY" && input.direction !== "SELL") {
    errors.push({ field: "direction", message: "Choose Buy or Sell." });
  }

  if (!isPositiveFinite(input.entryPrice)) {
    errors.push({ field: "entryPrice", message: "Enter a positive entry price." });
  }
  if (!isPositiveFinite(input.stopLossPrice)) {
    errors.push({ field: "stopLossPrice", message: "Enter a positive stop-loss price." });
  }

  if (
    isPositiveFinite(input.entryPrice) &&
    isPositiveFinite(input.stopLossPrice) &&
    input.entryPrice === input.stopLossPrice
  ) {
    errors.push({
      field: "stopLossPrice",
      message: "Stop-loss cannot equal the entry price — there would be no defined risk.",
    });
  }

  // Direction sanity: only checked once both prices are valid and differ.
  if (
    isPositiveFinite(input.entryPrice) &&
    isPositiveFinite(input.stopLossPrice) &&
    input.entryPrice !== input.stopLossPrice &&
    (input.direction === "BUY" || input.direction === "SELL")
  ) {
    if (input.direction === "BUY" && input.stopLossPrice > input.entryPrice) {
      errors.push({
        field: "stopLossPrice",
        message: "For a Buy trade the stop-loss should be below the entry price. Please check your prices.",
      });
    }
    if (input.direction === "SELL" && input.stopLossPrice < input.entryPrice) {
      errors.push({
        field: "stopLossPrice",
        message: "For a Sell trade the stop-loss should be above the entry price. Please check your prices.",
      });
    }
  }

  if (!isRiskModeId(input.riskModeId)) {
    errors.push({ field: "riskModeId", message: "Choose a KIRA risk mode." });
  }

  if (input.numberOfEntries != null) {
    if (!Number.isInteger(input.numberOfEntries) || input.numberOfEntries < 1 || input.numberOfEntries > 10) {
      errors.push({ field: "numberOfEntries", message: "Number of entries must be a whole number between 1 and 10." });
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, equity };
}
