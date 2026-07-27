import { describe, it, expect } from "vitest";
import { buildSignalToken, verifySignalToken, buildSignalCalculatorUrl } from "./signal-prefill";

const SECRET = "test-signal-secret-value";

const signal = {
  signalId: "KIRA-XAUUSD-2026-001",
  instrument: "XAUUSD",
  direction: "BUY" as const,
  entryType: "RANGE" as const,
  entryMinimum: 4050,
  entryMaximum: 4055,
  stopLoss: 4038,
};

describe("signal prefill tokens", () => {
  it("round-trips a valid token", () => {
    const token = buildSignalToken(signal, SECRET, 3600);
    const res = verifySignalToken(token, SECRET);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.payload.instrument).toBe("XAUUSD");
    expect(res.payload.entryMaximum).toBe(4055);
    expect(res.payload.stopLoss).toBe(4038);
  });

  it("rejects a tampered body", () => {
    const token = buildSignalToken(signal, SECRET, 3600);
    const [body, sig] = token.split(".");
    const tampered = `${body}x.${sig}`;
    const res = verifySignalToken(tampered, SECRET);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(["bad_signature", "malformed"]).toContain(res.reason);
  });

  it("rejects a token signed with a different secret", () => {
    const token = buildSignalToken(signal, "other-secret", 3600);
    const res = verifySignalToken(token, SECRET);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.reason).toBe("bad_signature");
  });

  it("rejects an expired token", () => {
    // exp one hour in the past
    const token = buildSignalToken({ ...signal, exp: Math.floor(Date.now() / 1000) - 3600 }, SECRET);
    const res = verifySignalToken(token, SECRET);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.reason).toBe("expired");
  });

  it("rejects malformed input", () => {
    expect(verifySignalToken("", SECRET).ok).toBe(false);
    expect(verifySignalToken("no-dot-here", SECRET).ok).toBe(false);
  });

  it("builds a Mini App deep link whose token verifies", () => {
    const url = buildSignalCalculatorUrl(signal, SECRET, "https://x.test/telegram");
    expect(url.startsWith("https://x.test/telegram?s=")).toBe(true);
    const token = decodeURIComponent(url.split("s=")[1]);
    const res = verifySignalToken(token, SECRET);
    expect(res.ok).toBe(true);
  });
});
