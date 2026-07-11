import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractIpHint } from "./config";

vi.mock("@/lib/db/prisma", () => ({ getPrismaClient: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));
vi.mock("bcryptjs", () => ({ default: { compare: vi.fn() } }));

describe("extractIpHint", () => {
  it("returns the first address from a comma-separated x-forwarded-for header", () => {
    expect(extractIpHint({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" })).toBe("1.2.3.4");
  });

  it("returns an empty string when the header is missing", () => {
    expect(extractIpHint(undefined)).toBe("");
    expect(extractIpHint({})).toBe("");
  });

  it("handles an array header value (some runtimes deliver headers this way)", () => {
    expect(extractIpHint({ "x-forwarded-for": ["9.9.9.9"] })).toBe("9.9.9.9");
  });
});

describe("authorizeCredentials", () => {
  beforeEach(() => vi.resetModules());

  async function loadWithMocks(opts: {
    prisma?: unknown;
    rateLimited?: { email?: boolean; ip?: boolean };
    passwordValid?: boolean;
  }) {
    const { rateLimited = {}, passwordValid = true } = opts;
    vi.doMock("@/lib/db/prisma", () => ({ getPrismaClient: () => opts.prisma ?? null }));
    vi.doMock("@/lib/rate-limit", () => ({
      checkRateLimit: vi.fn(async (_prisma: unknown, { bucket }: { bucket: string }) => {
        if (bucket.startsWith("login:email:") && rateLimited.email) return { limited: true, reason: "too many" };
        if (bucket.startsWith("login:ip:") && rateLimited.ip) return { limited: true, reason: "too many" };
        return { limited: false };
      }),
    }));
    vi.doMock("bcryptjs", () => ({ default: { compare: vi.fn(async () => passwordValid) } }));
    const mod = await import("./config");
    return mod.authorizeCredentials;
  }

  it("returns null when Prisma isn't configured", async () => {
    const authorize = await loadWithMocks({ prisma: null });
    const result = await authorize({ email: "a@example.com", password: "secret123" }, undefined);
    expect(result).toBeNull();
  });

  it("returns null when email or password is missing", async () => {
    const authorize = await loadWithMocks({ prisma: {} });
    expect(await authorize({ email: "", password: "secret123" }, undefined)).toBeNull();
    expect(await authorize({ email: "a@example.com", password: "" }, undefined)).toBeNull();
  });

  it("throws TOO_MANY_ATTEMPTS when the per-email login bucket is limited", async () => {
    const authorize = await loadWithMocks({ prisma: {}, rateLimited: { email: true } });
    await expect(authorize({ email: "a@example.com", password: "secret123" }, undefined)).rejects.toThrow(
      "TOO_MANY_ATTEMPTS"
    );
  });

  it("throws TOO_MANY_ATTEMPTS when the per-IP login bucket is limited", async () => {
    const authorize = await loadWithMocks({ prisma: {}, rateLimited: { ip: true } });
    await expect(
      authorize({ email: "a@example.com", password: "secret123" }, { headers: { "x-forwarded-for": "1.2.3.4" } })
    ).rejects.toThrow("TOO_MANY_ATTEMPTS");
  });

  it("returns null when no user matches the email", async () => {
    const prisma = { user: { findUnique: vi.fn().mockResolvedValue(null) } };
    const authorize = await loadWithMocks({ prisma });
    const result = await authorize({ email: "a@example.com", password: "secret123" }, undefined);
    expect(result).toBeNull();
  });

  it("returns null when the password doesn't match", async () => {
    const prisma = {
      user: { findUnique: vi.fn().mockResolvedValue({ id: "1", email: "a@example.com", passwordHash: "hash" }) },
    };
    const authorize = await loadWithMocks({ prisma, passwordValid: false });
    const result = await authorize({ email: "a@example.com", password: "wrong" }, undefined);
    expect(result).toBeNull();
  });

  it("throws EMAIL_NOT_VERIFIED for a correct password on an unverified account", async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: "1",
          email: "a@example.com",
          passwordHash: "hash",
          emailVerified: null,
        }),
      },
    };
    const authorize = await loadWithMocks({ prisma });
    await expect(authorize({ email: "a@example.com", password: "secret123" }, undefined)).rejects.toThrow(
      "EMAIL_NOT_VERIFIED"
    );
  });

  it("returns the user on valid, verified credentials", async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: "1",
          email: "a@example.com",
          name: "Test User",
          passwordHash: "hash",
          emailVerified: new Date(),
        }),
      },
    };
    const authorize = await loadWithMocks({ prisma });
    const result = await authorize({ email: "a@example.com", password: "secret123" }, undefined);
    expect(result).toEqual({ id: "1", email: "a@example.com", name: "Test User" });
  });
});
