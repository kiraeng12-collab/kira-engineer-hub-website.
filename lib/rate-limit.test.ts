import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkFormRateLimit, checkRateLimit } from "./rate-limit";
import type { PrismaClient } from "@/lib/generated/prisma";

function fakePrisma(overrides: {
  formSubmissionCount?: number;
  rateLimitEventCount?: number;
} = {}): PrismaClient {
  return {
    formSubmission: {
      count: vi.fn().mockResolvedValue(overrides.formSubmissionCount ?? 0),
    },
    rateLimitEvent: {
      count: vi.fn().mockResolvedValue(overrides.rateLimitEventCount ?? 0),
      create: vi.fn().mockResolvedValue({}),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("checkFormRateLimit", () => {
  it("allows requests under both the email and IP thresholds", async () => {
    const prisma = fakePrisma({ formSubmissionCount: 1 });
    const result = await checkFormRateLimit(prisma, { email: "a@example.com", ipHint: "1.2.3.4" });
    expect(result.limited).toBe(false);
  });

  it("blocks once the per-email count reaches the max", async () => {
    const prisma = fakePrisma({ formSubmissionCount: 5 });
    const result = await checkFormRateLimit(prisma, { email: "a@example.com", ipHint: "" });
    expect(result.limited).toBe(true);
    expect(result.reason).toMatch(/email address/i);
  });

  it("blocks once the per-IP count reaches the max, checked after the email count passes", async () => {
    const prisma = fakePrisma();
    (prisma.formSubmission.count as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(1) // email count: under threshold
      .mockResolvedValueOnce(10); // ip count: at threshold
    const result = await checkFormRateLimit(prisma, { email: "a@example.com", ipHint: "1.2.3.4" });
    expect(result.limited).toBe(true);
    expect(result.reason).toMatch(/network/i);
  });

  it("skips the IP check entirely when no ipHint is provided", async () => {
    const prisma = fakePrisma({ formSubmissionCount: 1 });
    await checkFormRateLimit(prisma, { email: "a@example.com", ipHint: "" });
    // Only the email-count query should have run.
    expect(prisma.formSubmission.count).toHaveBeenCalledTimes(1);
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows the attempt and records an event when under the max", async () => {
    const prisma = fakePrisma({ rateLimitEventCount: 2 });
    const result = await checkRateLimit(prisma, { bucket: "login:email:a@example.com", windowMinutes: 15, max: 8 });
    expect(result.limited).toBe(false);
    expect(prisma.rateLimitEvent.create).toHaveBeenCalledWith({ data: { bucket: "login:email:a@example.com" } });
  });

  it("blocks once the bucket's count reaches max, without recording another event", async () => {
    const prisma = fakePrisma({ rateLimitEventCount: 8 });
    const result = await checkRateLimit(prisma, { bucket: "login:email:a@example.com", windowMinutes: 15, max: 8 });
    expect(result.limited).toBe(true);
    expect(result.reason).toMatch(/too many attempts/i);
    expect(prisma.rateLimitEvent.create).not.toHaveBeenCalled();
  });

  it("scopes the count query to the given bucket", async () => {
    const prisma = fakePrisma({ rateLimitEventCount: 0 });
    await checkRateLimit(prisma, { bucket: "register:ip:9.9.9.9", windowMinutes: 60, max: 15 });
    expect(prisma.rateLimitEvent.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ bucket: "register:ip:9.9.9.9" }) })
    );
  });
});
