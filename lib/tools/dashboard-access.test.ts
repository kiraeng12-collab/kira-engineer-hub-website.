import { describe, it, expect, vi, beforeEach } from "vitest";

// The dashboard gate reaches out to next-auth, Prisma, and Telegram; mock all
// three so we can drive every access path deterministically and PROVE that a
// non-VIP-group user can never get in.
vi.mock("next-auth/next", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth/config", () => ({ authOptions: {} }));
vi.mock("@/lib/db/prisma", () => ({ getPrismaClient: vi.fn() }));
vi.mock("@/lib/telegram/client", () => ({ getTelegramConfig: vi.fn(), isVipGroupMember: vi.fn() }));
vi.mock("@/lib/telegram/init-data", () => ({ verifyTelegramInitData: vi.fn() }));

import { resolveDashboardAccess } from "./dashboard-access";
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
  return new Request("https://x/api/tools/dashboard", {
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

describe("resolveDashboardAccess — VIP group/channel membership is the ONLY key", () => {
  it("denies with no identity at all (no session, no initData)", async () => {
    const r = await resolveDashboardAccess(req());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(401);
    expect(isVipGroupMember).not.toHaveBeenCalled();
  });

  it("denies a forged / unverifiable initData (HMAC fails)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(verifyTelegramInitData).mockReturnValue({ ok: false } as any);
    const r = await resolveDashboardAccess(req("forged.payload"));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(401);
    expect(isVipGroupMember).not.toHaveBeenCalled();
  });

  it("denies a VERIFIED member who is NOT in the VIP group/channel", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(verifyTelegramInitData).mockReturnValue({ ok: true, user: { id: "555" } } as any);
    vi.mocked(isVipGroupMember).mockResolvedValue(false);
    const r = await resolveDashboardAccess(req("valid"));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(403);
    expect(isVipGroupMember).toHaveBeenCalledWith(cfg, "555");
  });

  it("ALLOWS a verified member who IS in the VIP group/channel", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(verifyTelegramInitData).mockReturnValue({ ok: true, user: { id: "555" } } as any);
    vi.mocked(isVipGroupMember).mockResolvedValue(true);
    const r = await resolveDashboardAccess(req("valid"));
    expect(r.ok).toBe(true);
  });

  it("fails CLOSED when the Telegram membership check errors out", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(verifyTelegramInitData).mockReturnValue({ ok: true, user: { id: "555" } } as any);
    vi.mocked(isVipGroupMember).mockRejectedValue(new Error("telegram unreachable"));
    const r = await resolveDashboardAccess(req("valid"));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(403);
  });

  it("denies a signed-in website user NOT in the group — NO entitlement bypass", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(getPrismaClient).mockReturnValue(fakePrisma({ telegramUserId: "555" }));
    vi.mocked(isVipGroupMember).mockResolvedValue(false); // left the group
    const r = await resolveDashboardAccess(req());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(403);
  });

  it("denies a signed-in website user with NO linked Telegram (membership unprovable)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(getPrismaClient).mockReturnValue(fakePrisma({ telegramUserId: null }));
    const r = await resolveDashboardAccess(req());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(401);
    expect(isVipGroupMember).not.toHaveBeenCalled();
  });
});
