import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getTelegramConfig, membershipChatIds } from "./client";

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
    const config = getTelegramConfig();
    expect(config && membershipChatIds(config)).toEqual(["-100111", "-100222"]);
  });
});
