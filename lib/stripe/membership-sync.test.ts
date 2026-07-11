import { describe, it, expect, vi } from "vitest";
import type Stripe from "stripe";
import {
  customerIdOf,
  upsertMembershipFromSubscription,
  setMembershipStatusByCustomer,
} from "./membership-sync";
import type { PrismaClient } from "@/lib/generated/prisma";

vi.mock("@/lib/telegram/membership-sync", () => ({ syncTelegramAccessForUser: vi.fn().mockResolvedValue(undefined) }));

function fakePrisma(overrides: {
  user?: unknown;
  existingMembership?: unknown;
} = {}): PrismaClient {
  return {
    user: {
      findUnique: vi.fn().mockResolvedValue(overrides.user ?? null),
    },
    membership: {
      findUnique: vi.fn().mockResolvedValue(overrides.existingMembership ?? null),
      upsert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

function fakeSubscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    id: "sub_123",
    customer: "cus_123",
    status: "active",
    cancel_at_period_end: false,
    metadata: {},
    items: { data: [{ current_period_end: 1735689600 }] },
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe("customerIdOf", () => {
  it("returns the string as-is", () => {
    expect(customerIdOf("cus_123")).toBe("cus_123");
  });

  it("extracts .id from a customer object", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(customerIdOf({ id: "cus_456" } as any)).toBe("cus_456");
  });

  it("returns null for null/undefined", () => {
    expect(customerIdOf(null)).toBeNull();
    expect(customerIdOf(undefined)).toBeNull();
  });
});

describe("upsertMembershipFromSubscription", () => {
  it("is a no-op when the customer isn't linked to any user", async () => {
    const prisma = fakePrisma({ user: null });
    await upsertMembershipFromSubscription(prisma, fakeSubscription(), 1700000000);
    expect(prisma.membership.upsert).not.toHaveBeenCalled();
  });

  it("upserts the membership when the customer is known and there's no prior record", async () => {
    const prisma = fakePrisma({ user: { id: "user_1" }, existingMembership: null });
    await upsertMembershipFromSubscription(prisma, fakeSubscription(), 1700000000);
    expect(prisma.membership.upsert).toHaveBeenCalledTimes(1);
    const call = (prisma.membership.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.where).toEqual({ userId: "user_1" });
    expect(call.create.status).toBe("active");
  });

  it("never lets an older event overwrite a newer membership state (out-of-order guard)", async () => {
    const prisma = fakePrisma({
      user: { id: "user_1" },
      existingMembership: { lastEventCreatedAt: new Date(1800000000 * 1000), plan: "quarterly", tier: "founding" },
    });
    // This event's timestamp (1700000000) is older than the recorded lastEventCreatedAt.
    await upsertMembershipFromSubscription(prisma, fakeSubscription(), 1700000000);
    expect(prisma.membership.upsert).not.toHaveBeenCalled();
  });

  it("applies a newer event over an older recorded state", async () => {
    const prisma = fakePrisma({
      user: { id: "user_1" },
      existingMembership: { lastEventCreatedAt: new Date(1600000000 * 1000), plan: "monthly", tier: null },
    });
    await upsertMembershipFromSubscription(prisma, fakeSubscription(), 1700000000);
    expect(prisma.membership.upsert).toHaveBeenCalledTimes(1);
  });

  it("falls back to the existing plan/tier when subscription metadata is absent", async () => {
    const prisma = fakePrisma({
      user: { id: "user_1" },
      existingMembership: { lastEventCreatedAt: null, plan: "quarterly", tier: "early_bird" },
    });
    await upsertMembershipFromSubscription(prisma, fakeSubscription({ metadata: {} }), 1700000000);
    const call = (prisma.membership.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.create.plan).toBe("quarterly");
    expect(call.create.tier).toBe("early_bird");
  });
});

describe("setMembershipStatusByCustomer", () => {
  it("is a no-op when there's no customerId", async () => {
    const prisma = fakePrisma();
    await setMembershipStatusByCustomer(prisma, null, "cancelled", 1700000000);
    expect(prisma.membership.update).not.toHaveBeenCalled();
  });

  it("is a no-op when no membership record exists yet", async () => {
    const prisma = fakePrisma({ user: { id: "user_1" }, existingMembership: null });
    await setMembershipStatusByCustomer(prisma, "cus_123", "cancelled", 1700000000);
    expect(prisma.membership.update).not.toHaveBeenCalled();
  });

  it("never lets an older event overwrite a newer membership state (out-of-order guard)", async () => {
    const prisma = fakePrisma({
      user: { id: "user_1" },
      existingMembership: { lastEventCreatedAt: new Date(1800000000 * 1000) },
    });
    await setMembershipStatusByCustomer(prisma, "cus_123", "cancelled", 1700000000);
    expect(prisma.membership.update).not.toHaveBeenCalled();
  });

  it("updates the status when the event is newer than the recorded state", async () => {
    const prisma = fakePrisma({
      user: { id: "user_1" },
      existingMembership: { lastEventCreatedAt: new Date(1600000000 * 1000) },
    });
    await setMembershipStatusByCustomer(prisma, "cus_123", "past_due", 1700000000);
    expect(prisma.membership.update).toHaveBeenCalledWith({
      where: { userId: "user_1" },
      data: { status: "past_due", lastEventCreatedAt: new Date(1700000000 * 1000) },
    });
  });
});
