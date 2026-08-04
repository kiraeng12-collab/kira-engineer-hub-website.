import { describe, it, expect } from "vitest";
import { parseTradeSignal, parseTradeUpdate } from "./parser";

describe("parseTradeSignal", () => {
  it("parses the multi-line BUY post", () => {
    const post = `XAUUSD-BUY

SIZE= BIG

Wait confirmation

🔷 Entry range: 4015

🔷 Stop Loss: 4005

🔷 Take Profit 1: 4025
🔷 Take Profit 2: 4035

Adhere to risk management`;
    const s = parseTradeSignal(post);
    expect(s).not.toBeNull();
    expect(s!.symbol).toBe("XAUUSD");
    expect(s!.direction).toBe("BUY");
    expect(s!.size).toBe("big");
    expect(s!.entryMin).toBe(4015);
    expect(s!.entryMax).toBe(4015);
    expect(s!.stopLoss).toBe(4005);
    expect(s!.takeProfits).toEqual([4025, 4035]);
  });

  it("parses the one-line SELL post with an entry range", () => {
    const post = "XAUUSD-sell SIZE= Normal Wait confirmation 🔷 Entry range: 4088-4092 Stop Loss: 4100 TP1: 4075 TP2: 4060";
    const s = parseTradeSignal(post);
    expect(s).not.toBeNull();
    expect(s!.symbol).toBe("XAUUSD");
    expect(s!.direction).toBe("SELL");
    expect(s!.size).toBe("medium");
    expect(s!.entryMin).toBe(4088);
    expect(s!.entryMax).toBe(4092);
    expect(s!.stopLoss).toBe(4100);
    expect(s!.takeProfits).toEqual([4075, 4060]);
  });

  it("handles an index symbol and spaced direction", () => {
    const s = parseTradeSignal("US30 BUY entry 44000 SL 43800 TP 44300");
    expect(s!.symbol).toBe("US30");
    expect(s!.direction).toBe("BUY");
    expect(s!.entryMin).toBe(44000);
    expect(s!.stopLoss).toBe(43800);
    expect(s!.takeProfits).toEqual([44300]);
  });

  it("normalises a reversed range", () => {
    const s = parseTradeSignal("EURUSD-BUY entry 1.0920-1.0900 SL 1.0880");
    expect(s!.entryMin).toBe(1.09);
    expect(s!.entryMax).toBe(1.092);
  });

  it("returns null for a non-trade message", () => {
    expect(parseTradeSignal("Good morning team, markets are quiet today")).toBeNull();
    expect(parseTradeSignal("KIRA ENGINEER HUB IS OFFICIALLY LIVE")).toBeNull();
  });

  it("returns null when there is a direction but no levels", () => {
    expect(parseTradeSignal("We might look at XAUUSD-BUY later, wait for it")).toBeNull();
  });
});

describe("parseTradeUpdate", () => {
  it("detects TP1 and TP2", () => {
    expect(parseTradeUpdate("TP1")).toEqual({ type: "tp1" });
    expect(parseTradeUpdate("TP2 ✅")).toEqual({ type: "tp2" });
    expect(parseTradeUpdate("Take Profit 1 hit 🎯")).toEqual({ type: "tp1" });
  });

  it("detects break-even before stop-loss", () => {
    expect(parseTradeUpdate("Move SL to BE")).toEqual({ type: "be", price: null });
    expect(parseTradeUpdate("breakeven now")).toEqual({ type: "be", price: null });
    expect(parseTradeUpdate("BE 4015")).toEqual({ type: "be", price: 4015 });
  });

  it("detects stop-loss and close", () => {
    expect(parseTradeUpdate("SL hit")).toEqual({ type: "sl" });
    expect(parseTradeUpdate("stopped out")).toEqual({ type: "sl" });
    expect(parseTradeUpdate("closed")).toEqual({ type: "close" });
  });

  it("detects a generic target hit", () => {
    expect(parseTradeUpdate("target hit ✅")).toEqual({ type: "tp" });
  });

  it("reads slash-command forms", () => {
    expect(parseTradeUpdate("/tp1")).toEqual({ type: "tp1" });
    expect(parseTradeUpdate("/tp2")).toEqual({ type: "tp2" });
    expect(parseTradeUpdate("/exit")).toEqual({ type: "close" });
  });

  it("detects entry activation (/enter)", () => {
    expect(parseTradeUpdate("/enter")).toEqual({ type: "enter" });
    expect(parseTradeUpdate("entered ✅")).toEqual({ type: "enter" });
    expect(parseTradeUpdate("order filled")).toEqual({ type: "enter" });
    expect(parseTradeUpdate("activated")).toEqual({ type: "enter" });
  });

  it("detects cancel as distinct from a manual close", () => {
    expect(parseTradeUpdate("/cancel")).toEqual({ type: "cancel" });
    expect(parseTradeUpdate("cancelled")).toEqual({ type: "cancel" });
    expect(parseTradeUpdate("no trade")).toEqual({ type: "cancel" });
  });

  it("returns null for unrelated replies", () => {
    expect(parseTradeUpdate("great call! 🔥")).toBeNull();
    expect(parseTradeUpdate("thanks")).toBeNull();
  });
});
