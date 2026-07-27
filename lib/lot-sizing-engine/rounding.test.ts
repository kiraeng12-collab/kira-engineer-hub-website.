import { describe, it, expect } from "vitest";
import { roundDownToStep, Decimal } from "./rounding";

describe("roundDownToStep", () => {
  it("floors to the volume step and never rounds up", () => {
    expect(roundDownToStep(0.029411, 0.01).toString()).toBe("0.02");
    expect(roundDownToStep(0.04999, 0.01).toString()).toBe("0.04");
    expect(roundDownToStep(0.05, 0.01).toString()).toBe("0.05");
  });

  it("handles coarse steps", () => {
    expect(roundDownToStep(1.7, 0.5).toString()).toBe("1.5");
    expect(roundDownToStep(3, 1).toString()).toBe("3");
  });

  it("returns zero for sub-step values", () => {
    expect(roundDownToStep(0.009, 0.01).toString()).toBe("0");
  });

  it("returns the value unchanged when step is zero", () => {
    expect(roundDownToStep(0.037, 0).toString()).toBe("0.037");
  });

  it("does not introduce floating-point drift", () => {
    // 0.1 + 0.2 style drift must not appear
    expect(roundDownToStep(new Decimal("0.1").plus("0.2"), 0.01).toString()).toBe("0.3");
  });
});
