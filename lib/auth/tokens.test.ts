import { describe, it, expect } from "vitest";
import { generateRawToken, hashToken, isExpired } from "./tokens";

describe("generateRawToken", () => {
  it("generates a URL-safe token with sufficient length", () => {
    const token = generateRawToken();
    expect(token.length).toBeGreaterThan(30);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("generates different tokens on repeated calls", () => {
    expect(generateRawToken()).not.toBe(generateRawToken());
  });
});

describe("hashToken", () => {
  it("is deterministic for the same input", () => {
    const token = generateRawToken();
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it("produces different hashes for different tokens", () => {
    expect(hashToken("a")).not.toBe(hashToken("b"));
  });

  it("never reveals the raw token in the hash", () => {
    const token = "my-raw-token-value";
    expect(hashToken(token)).not.toContain(token);
  });
});

describe("isExpired", () => {
  it("returns true for a past date", () => {
    expect(isExpired(new Date(Date.now() - 1000))).toBe(true);
  });

  it("returns false for a future date", () => {
    expect(isExpired(new Date(Date.now() + 1000))).toBe(false);
  });
});
