import { describe, it, expect, vi, beforeEach } from "vitest";
import { shouldRevokeTelegramAccess, syncTelegramAccessForUser } from "./membership-sync";
import { membershipChatIds, getTelegramConfig, removeChatMember } from "./client";
import type { PrismaClient } from "@/lib/generated/prisma";

vi.mock("./client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./client")>();
  return {
    ...actual,
    getTelegramConfig: vi.fn(),
    removeChatMember: vi.fn(),
  };
});

const GROUP = "-100111";
const CHANNEL = "-100222";

function prismaStub(user: Record<string, unknown> | null) {
  const update = vi.fn().mockResolvedValue({});
  return {
    client: { user: { findUnique: vi.fn().mockResolvedValue(user), update } } as unknown as PrismaClient,
    update,
  };
}

describe("shouldRevokeTelegramAccess", () => {
  it("revokes access for cancelled, expired, suspended, refunded, and disputed", () => {
    expect(shouldRevokeTelegramAccess("cancelled")).toBe(true);
    expect(shouldRevokeTelegramAccess("expired")).toBe(true);
    expect(shouldRevokeTelegramAccess("suspended")).toBe(true);
    expect(shouldRevokeTelegramAccess("refunded")).toBe(true);
    expect(shouldRevokeTelegramAccess("disputed")).toBe(true);
  });

  it("does not revoke access for active or pending", () => {
    expect(shouldRevokeTelegramAccess("active")).toBe(false);
    expect(shouldRevokeTelegramAccess("pending")).toBe(false);
  });

  it("does not revoke access for past_due, preserving the payment-retry grace period", () => {
    expect(shouldRevokeTelegramAccess("past_due")).toBe(false);
  });
});

describe("membershipChatIds", () => {
  it("includes the channel when it is configured", () => {
    expect(
      membershipChatIds({ botToken: "t", botUsername: "b", groupChatId: GROUP, channelChatId: CHANNEL })
    ).toEqual([GROUP, CHANNEL]);
  });

  it("falls back to the group alone when no channel is configured", () => {
    expect(
      membershipChatIds({ botToken: "t", botUsername: "b", groupChatId: GROUP, channelChatId: null })
    ).toEqual([GROUP]);
  });
});

describe("syncTelegramAccessForUser", () => {
  beforeEach(() => {
    vi.mocked(removeChatMember).mockReset().mockResolvedValue(undefined);
    vi.mocked(getTelegramConfig).mockReturnValue({
      botToken: "t",
      botUsername: "b",
      groupChatId: GROUP,
      channelChatId: CHANNEL,
    });
  });

  it("removes a lapsed member from the group and the channel", async () => {
    const { client, update } = prismaStub({ telegramUserId: "42", telegramRemovedAt: null });

    await syncTelegramAccessForUser(client, "user-1", "cancelled");

    expect(vi.mocked(removeChatMember).mock.calls.map((c) => c[1])).toEqual([GROUP, CHANNEL]);
    expect(update).toHaveBeenCalledOnce();
  });

  it("still removes from the channel when the group removal fails, and does not mark them removed", async () => {
    const { client, update } = prismaStub({ telegramUserId: "42", telegramRemovedAt: null });
    vi.mocked(removeChatMember).mockRejectedValueOnce(new Error("group boom"));

    await expect(syncTelegramAccessForUser(client, "user-1", "cancelled")).rejects.toThrow(/group boom/);

    // The channel must not be skipped just because the group errored, or the
    // member keeps access to it indefinitely.
    expect(vi.mocked(removeChatMember).mock.calls.map((c) => c[1])).toEqual([GROUP, CHANNEL]);
    // Not marked removed, so the removal is retried rather than silently lost.
    expect(update).not.toHaveBeenCalled();
  });

  it("does nothing for a status that keeps access", async () => {
    const { client } = prismaStub({ telegramUserId: "42", telegramRemovedAt: null });
    await syncTelegramAccessForUser(client, "user-1", "past_due");
    expect(removeChatMember).not.toHaveBeenCalled();
  });
});
