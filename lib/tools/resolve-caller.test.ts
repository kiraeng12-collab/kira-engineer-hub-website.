import { describe, it, expect, vi, beforeEach } from "vitest";

// resolveCaller decides VIP vs free for the calculator. Mock its collaborators
// so we can PROVE that only a live VIP-group/channel member is "vip".
vi.mock("next-auth/next", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth/config", () => ({ authOptions: {} }));
vi.mock("@/lib/db/prisma", () => ({ getPrismaClient: vi.fn() }));
vi.mock("@/lib/telegram/client", () => ({ getTelegramConfig: vi.fn(), isVipGroupMember: vi.fn() }));
vi.mock("@/lib/telegram/init-data", () => ({ verifyTelegramInitData: vi.fn() }));

import { resolveCaller } from "./resolve-caller";
import { getServerSession } from "next-auth/next";
import { getPrismaClient } from "@/lib/db/prisma";
import { getTelegramConfig, isVipGroupMember } from "@/lib/telegram/client";
import { verifyTelegramInitData } from "@/lib/telegram/init-data";

const cfg = { botToken: "T", botUsername: "b", groupChatId: "-100g", channelChatId: "-100c" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fakePrisma(user: unknown = null): any {
  return { user: { findUnique: vi.fn().mockResolvedValue(user) } };
}
function req(initData?: string): Request {
  return new Request("https://x/api/tools/lot-size", {
    method: "POST",
    headers: initData ? { "x-telegram-init-data": initData } : {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPrismaClient).mockReturnValue(fakePrisma());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(getTelegramConfig).mockReturnValue(cfg as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(getServerSession).mockResolvedValue(null as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(verifyTelegramInitData).mockReturnValue({ ok: false } as any);
  vi.mocked(isVipGroupMember).mockResolvedValue(false);
});

describe("resolveCaller — calculator VIP requires VIP group/channel membership", () => {
  it("anonymous (no session, no initData) is free", async () => {
    const c = await resolveCaller(req());
    expect(c.access).toBe("free");
    expect(isVipGroupMember).not.toHaveBeenCalled();
  });

  it("forged / unverifiable initData is free", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(verifyTelegramInitData).mockReturnValue({ ok: false } as any);
    const c = await resolveCaller(req("forged"));
    expect(c.access).toBe("free");
    expect(isVipGroupMember).not.toHaveBeenCalled();
  });

  it("verified Telegram member NOT in the group is free", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(verifyTelegramInitData).mockReturnValue({ ok: true, user: { id: "555" } } as any);
    vi.mocked(isVipGroupMember).mockResolvedValue(false);
    const c = await resolveCaller(req("valid"));
    expect(c.access).toBe("free");
    expect(isVipGroupMember).toHaveBeenCalledWith(cfg, "555");
  });

  it("verified Telegram member IN the group is vip", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(verifyTelegramInitData).mockReturnValue({ ok: true, user: { id: "555" } } as any);
    vi.mocked(isVipGroupMember).mockResolvedValue(true);
    const c = await resolveCaller(req("valid"));
    expect(c.access).toBe("vip");
  });

  it("fails closed (free) when the membership check errors", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(verifyTelegramInitData).mockReturnValue({ ok: true, user: { id: "555" } } as any);
    vi.mocked(isVipGroupMember).mockRejectedValue(new Error("telegram down"));
    const c = await resolveCaller(req("valid"));
    expect(c.access).toBe("free");
  });

  it("signed-in website user linked + IN the group is vip", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(getPrismaClient).mockReturnValue(fakePrisma({ telegramUserId: "555" }));
    vi.mocked(isVipGroupMember).mockResolvedValue(true);
    const c = await resolveCaller(req());
    expect(c.access).toBe("vip");
    expect(c.userId).toBe("u1");
  });

  it("signed-in website user NOT in the group is free — NO entitlement bypass", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(getPrismaClient).mockReturnValue(fakePrisma({ telegramUserId: "555" }));
    vi.mocked(isVipGroupMember).mockResolvedValue(false); // left / never joined
    const c = await resolveCaller(req());
    expect(c.access).toBe("free");
  });

  it("signed-in website user with NO linked Telegram is free (can't prove membership)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(getPrismaClient).mockReturnValue(fakePrisma({ telegramUserId: null }));
    const c = await resolveCaller(req());
    expect(c.access).toBe("free");
    expect(isVipGroupMember).not.toHaveBeenCalled();
  });
});
