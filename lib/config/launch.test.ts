import { describe, it, expect } from "vitest";
import { hasLaunched, getLaunchAt } from "./launch";

const DEFAULT_ISO = new Date("2026-08-01T19:10:00+03:00").toISOString();

describe("launch gate", () => {
  it("defaults to 1 Aug 2026, 7:10 PM Jordan (UTC+3)", () => {
    expect(getLaunchAt({}).toISOString()).toBe(DEFAULT_ISO);
  });

  it("hasLaunched is false before and true after the moment", () => {
    expect(hasLaunched(new Date("2026-07-01T00:00:00Z"), {})).toBe(false);
    expect(hasLaunched(new Date("2026-09-01T00:00:00Z"), {})).toBe(true);
  });

  it("honours a valid LAUNCH_AT override", () => {
    expect(hasLaunched(new Date("2021-01-01T00:00:00Z"), { LAUNCH_AT: "2020-01-01T00:00:00Z" })).toBe(true);
  });

  it("falls back to the default when LAUNCH_AT is unparseable", () => {
    expect(getLaunchAt({ LAUNCH_AT: "not-a-date" }).toISOString()).toBe(DEFAULT_ISO);
  });
});
