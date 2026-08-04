import { describe, it, expect } from "vitest";
import { startOfTradingWeek } from "./store";

// 2024-01-01 is a Monday — anchor for the trading-week maths (default UTC).
describe("startOfTradingWeek", () => {
  it("returns Monday 00:00 for a mid-week time", () => {
    expect(startOfTradingWeek(new Date("2024-01-03T15:30:00Z")).toISOString()).toBe(
      "2024-01-01T00:00:00.000Z"
    );
  });

  it("returns the same instant at Monday midnight", () => {
    expect(startOfTradingWeek(new Date("2024-01-01T00:00:00Z")).toISOString()).toBe(
      "2024-01-01T00:00:00.000Z"
    );
  });

  it("keeps Sunday within the same trading week", () => {
    expect(startOfTradingWeek(new Date("2024-01-07T23:00:00Z")).toISOString()).toBe(
      "2024-01-01T00:00:00.000Z"
    );
  });

  it("rolls to a fresh week on the next Monday", () => {
    expect(startOfTradingWeek(new Date("2024-01-08T00:00:00Z")).toISOString()).toBe(
      "2024-01-08T00:00:00.000Z"
    );
  });
});
