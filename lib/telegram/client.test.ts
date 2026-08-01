import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getTelegramConfig,
  membershipChatIds,
  getChatMemberStatus,
  isVipGroupMember,
  type TelegramConfig,
} from "./client";

/** Mocks global.fetch to return the given Telegram API JSON bodies in order. */
function mockTelegram(...bodies: unknown[]) {
  const fn = vi.fn();
  for (const body of bodies) fn.mockResolvedValueOnce({ json: async () => body });
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

const config: TelegramConfig = {
  botToken: "token",
  botUsername: "KiratradingVIP_Bot",
  groupChatId: "-100111",
  channelChatId: null,
};

const KEYS = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_BOT_USERNAME",
  "TELEGRAM_GROUP_CHAT_ID",
  "TELEGRAM_CHANNEL_CHAT_ID",
] as const;

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  process.env.TELEGRAM_BOT_TOKEN = "token";
  process.env.TELEGRAM_BOT_USERNAME = "KiratradingVIP_Bot";
  process.env.TELEGRAM_GROUP_CHAT_ID = "-100111";
  delete process.env.TELEGRAM_CHANNEL_CHAT_ID;
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("getTelegramConfig", () => {
  it("trims values pasted with stray whitespace", () => {
    // A single leading space in the dashboard made Telegram reject the chat
    // id, and the only symptom was an invite that never arrived.
    process.env.TELEGRAM_CHANNEL_CHAT_ID = " -1002252250646";
    process.env.TELEGRAM_GROUP_CHAT_ID = "-100111\n";

    const config = getTelegramConfig();

    expect(config?.channelChatId).toBe("-1002252250646");
    expect(config?.groupChatId).toBe("-100111");
  });

  it("treats a whitespace-only channel id as absent rather than a real chat", () => {
    process.env.TELEGRAM_CHANNEL_CHAT_ID = "   ";
    expect(getTelegramConfig()?.channelChatId).toBeNull();
  });

  it("returns null when a required value is missing", () => {
    delete process.env.TELEGRAM_GROUP_CHAT_ID;
    expect(getTelegramConfig()).toBeNull();
  });

  it("invites into both chats once a channel is configured", () => {
    process.env.TELEGRAM_CHANNEL_CHAT_ID = "-100222";
    const cfg = getTelegramConfig();
    expect(cfg && membershipChatIds(cfg)).toEqual(["-100111", "-100222"]);
  });
});

describe("getChatMemberStatus", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns the membership status for a current member", async () => {
    mockTelegram({ ok: true, result: { status: "member" } });
    expect(await getChatMemberStatus("token", "-100111", 42)).toBe("member");
  });

  it("returns null when Telegram errors (user never in chat)", async () => {
    mockTelegram({ ok: false, description: "Bad Request: PARTICIPANT_ID_INVALID" });
    expect(await getChatMemberStatus("token", "-100111", 100)).toBeNull();
  });

  it("normalises a restricted-but-left member to 'left'", async () => {
    mockTelegram({ ok: true, result: { status: "restricted", is_member: false } });
    expect(await getChatMemberStatus("token", "-100111", 42)).toBe("left");
  });
});

describe("isVipGroupMember", () => {
  afterEach(() => vi.restoreAllMocks());

  it("is true for an active group member", async () => {
    mockTelegram({ ok: true, result: { status: "administrator" } });
    expect(await isVipGroupMember(config, 42)).toBe(true);
  });

  it("is false when the user has left and there is no channel", async () => {
    mockTelegram({ ok: true, result: { status: "left" } });
    expect(await isVipGroupMember(config, 42)).toBe(false);
  });

  it("is false when kicked", async () => {
    mockTelegram({ ok: true, result: { status: "kicked" } });
    expect(await isVipGroupMember(config, 42)).toBe(false);
  });

  it("checks the channel too and grants access on channel membership", async () => {
    // Group: not a member (error) -> then channel: member.
    mockTelegram(
      { ok: false, description: "PARTICIPANT_ID_INVALID" },
      { ok: true, result: { status: "member" } }
    );
    expect(await isVipGroupMember({ ...config, channelChatId: "-100222" }, 42)).toBe(true);
  });

  it("is false when a lookup fails and there is no other chat", async () => {
    mockTelegram({ ok: false, description: "some error" });
    expect(await isVipGroupMember(config, 42)).toBe(false);
  });
});
