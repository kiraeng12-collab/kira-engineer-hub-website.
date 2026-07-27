import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import { verifyTelegramInitData } from "./init-data";

const TOKEN = "123456:TEST_BOT_TOKEN_abcdef";

/** Builds a correctly-signed initData string the way Telegram would. */
function buildInitData(
  token: string,
  user: Record<string, unknown>,
  authDate: number
): string {
  const params = new URLSearchParams();
  params.set("auth_date", String(authDate));
  params.set("query_id", "AAExampleQueryId");
  params.set("user", JSON.stringify(user));

  const checkString = [...params.entries()].map(([k, v]) => `${k}=${v}`).sort().join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(token).digest();
  const hash = crypto.createHmac("sha256", secret).update(checkString).digest("hex");
  params.set("hash", hash);
  return params.toString();
}

const nowSec = Math.floor(Date.now() / 1000);
const user = { id: 987654321, username: "kira_trader", first_name: "Kira", is_premium: true };

describe("verifyTelegramInitData", () => {
  it("accepts a correctly-signed, fresh initData and extracts the user", () => {
    const initData = buildInitData(TOKEN, user, nowSec);
    const res = verifyTelegramInitData(initData, TOKEN);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.user.id).toBe("987654321");
    expect(res.user.username).toBe("kira_trader");
    expect(res.user.isPremium).toBe(true);
  });

  it("rejects a tampered payload (changed user id after signing)", () => {
    const initData = buildInitData(TOKEN, user, nowSec);
    const tampered = initData.replace("987654321", "111111111");
    const res = verifyTelegramInitData(tampered, TOKEN);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.reason).toBe("bad_signature");
  });

  it("rejects a signature made with a different bot token", () => {
    const initData = buildInitData("999:OTHER_TOKEN", user, nowSec);
    const res = verifyTelegramInitData(initData, TOKEN);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.reason).toBe("bad_signature");
  });

  it("rejects an expired initData", () => {
    const initData = buildInitData(TOKEN, user, nowSec - 48 * 3600);
    const res = verifyTelegramInitData(initData, TOKEN);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.reason).toBe("expired");
  });

  it("rejects when the hash field is missing", () => {
    const res = verifyTelegramInitData("auth_date=1&user=%7B%7D", TOKEN);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.reason).toBe("missing_hash");
  });

  it("rejects empty input", () => {
    expect(verifyTelegramInitData("", TOKEN).ok).toBe(false);
    expect(verifyTelegramInitData("x=1", "").ok).toBe(false);
  });
});
