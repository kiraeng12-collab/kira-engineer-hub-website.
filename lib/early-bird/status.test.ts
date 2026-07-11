import { describe, it, expect } from "vitest";
import { describeEarlyBirdStatus } from "./status";

describe("describeEarlyBirdStatus", () => {
  it("treats submitted and under_review as pending", () => {
    expect(describeEarlyBirdStatus("submitted").heading).toBe("Under review");
    expect(describeEarlyBirdStatus("under_review").heading).toBe("Under review");
  });

  it("treats approved, code_issued, and redeemed as verified", () => {
    expect(describeEarlyBirdStatus("approved").heading).toBe("Verified");
    expect(describeEarlyBirdStatus("code_issued").heading).toBe("Verified");
    expect(describeEarlyBirdStatus("redeemed").heading).toBe("Verified");
  });

  it("labels rejected and suspended distinctly", () => {
    expect(describeEarlyBirdStatus("rejected").heading).toBe("Not approved");
    expect(describeEarlyBirdStatus("suspended").heading).toBe("Suspended");
  });

  it("defaults an unrecognized status to pending rather than guessing", () => {
    expect(describeEarlyBirdStatus("some_future_status").heading).toBe("Under review");
  });
});
