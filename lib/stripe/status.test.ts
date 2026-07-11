import { describe, it, expect } from "vitest";
import { mapSubscriptionStatus } from "./status";

describe("mapSubscriptionStatus", () => {
  it("maps active and trialing to active", () => {
    expect(mapSubscriptionStatus("active")).toBe("active");
    expect(mapSubscriptionStatus("trialing")).toBe("active");
  });

  it("maps past_due to past_due", () => {
    expect(mapSubscriptionStatus("past_due")).toBe("past_due");
  });

  it("maps canceled to cancelled", () => {
    expect(mapSubscriptionStatus("canceled")).toBe("cancelled");
  });

  it("maps unpaid and paused to suspended", () => {
    expect(mapSubscriptionStatus("unpaid")).toBe("suspended");
    expect(mapSubscriptionStatus("paused")).toBe("suspended");
  });

  it("maps incomplete_expired to expired", () => {
    expect(mapSubscriptionStatus("incomplete_expired")).toBe("expired");
  });

  it("maps incomplete to pending", () => {
    expect(mapSubscriptionStatus("incomplete")).toBe("pending");
  });

  it("defaults unrecognized or future Stripe statuses to pending", () => {
    expect(mapSubscriptionStatus("some_future_status")).toBe("pending");
    expect(mapSubscriptionStatus("")).toBe("pending");
  });
});
