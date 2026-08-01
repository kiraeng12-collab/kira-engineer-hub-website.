import "server-only";

/**
 * Read/write a member's copy settings (lot rule, multiplier, max lot) on the
 * bridge. The bridge is the source of truth and clamps every value to the owner
 * ceilings — the website only presents and forwards. Owner key stays server-side.
 */

export type CopySettings = {
  lotSizingMode: "SAME" | "MULTIPLY" | "REDUCE";
  lotMultiplier: number;
  maxLot: number;
};

export type CopySettingsView = {
  configured: boolean;
  available: boolean; // bridge reachable + member registered
  settings: CopySettings;
  ceilings: { maxMultiplier: number; maxLot: number };
};

const DEFAULTS: CopySettings = { lotSizingMode: "SAME", lotMultiplier: 1, maxLot: 1 };
const DEFAULT_CEILINGS = { maxMultiplier: 3, maxLot: 1 };

function bridgeEnv() {
  const url = process.env.COPY_BRIDGE_URL;
  const ownerKey = process.env.COPY_BRIDGE_OWNER_KEY;
  return url && ownerKey ? { url, ownerKey } : null;
}

export async function getCopySettings(userId: string): Promise<CopySettingsView> {
  const env = bridgeEnv();
  const base: CopySettingsView = {
    configured: Boolean(env),
    available: false,
    settings: DEFAULTS,
    ceilings: DEFAULT_CEILINGS,
  };
  if (!env) return base;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(new URL(`/v1/admin/members/${encodeURIComponent(userId)}/copy-settings`, env.url).toString(), {
      headers: { "x-kira-owner-key": env.ownerKey },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return base;
    const data = (await res.json()) as { settings?: Partial<CopySettings>; ceilings?: { maxMultiplier: number; maxLot: number } };
    return {
      configured: true,
      available: true,
      settings: { ...DEFAULTS, ...(data.settings ?? {}) } as CopySettings,
      ceilings: data.ceilings ?? DEFAULT_CEILINGS,
    };
  } catch {
    return base;
  } finally {
    clearTimeout(timeout);
  }
}

// Returns the applied (clamped-by-bridge) settings, or null on failure.
export async function saveCopySettings(userId: string, input: CopySettings): Promise<CopySettings | null> {
  const env = bridgeEnv();
  if (!env) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(new URL(`/v1/admin/members/${encodeURIComponent(userId)}/copy-settings`, env.url).toString(), {
      method: "POST",
      headers: { "x-kira-owner-key": env.ownerKey, "content-type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { settings?: CopySettings };
    return data.settings ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
