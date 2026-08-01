import "server-only";

/**
 * Server-side read helpers for the copy bridge. Used by the member Copy Trading
 * area to show a member their own copier status and access key. All calls use
 * the owner key server-side (never exposed to the browser) and fail soft — they
 * return a "not available" shape rather than throwing, so the page always renders.
 *
 * memberId on the bridge is the KIRA user id (see lib/copy-bridge/sync.ts).
 */

export type AccountTelemetry = {
  balance: number;
  equity: number;
  margin: number;
  marginLevel: number;
  openPositions: number;
  currency: string;
  pnlToday: number;
  pnlTotal: number;
  fresh: boolean;
  secondsSinceReport: number;
};

export type MemberCopyStatus = {
  configured: boolean; // bridge env is set
  registered: boolean; // this member exists on the bridge yet
  online: boolean;
  status: string | null; // COPYING | MANUAL_REVIEW | BLOCKED_RISK | CONNECTED | OFFLINE | null
  statusLabel: string | null;
  lotRule: string | null;
  secondsSinceSeen: number | null;
  mode: "LIVE" | "DEMO" | null;
  telemetry: AccountTelemetry | null;
};

function bridgeEnv() {
  const url = process.env.COPY_BRIDGE_URL;
  const ownerKey = process.env.COPY_BRIDGE_OWNER_KEY;
  return url && ownerKey ? { url, ownerKey } : null;
}

async function call(path: string, init?: RequestInit) {
  const env = bridgeEnv();
  if (!env) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(new URL(path, env.url).toString(), {
      ...init,
      headers: { "x-kira-owner-key": env.ownerKey, ...(init?.headers ?? {}) },
      cache: "no-store",
      signal: controller.signal,
    });
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getMemberCopyStatus(userId: string): Promise<MemberCopyStatus> {
  const base: MemberCopyStatus = {
    configured: Boolean(bridgeEnv()),
    registered: false,
    online: false,
    status: null,
    statusLabel: null,
    lotRule: null,
    secondsSinceSeen: null,
    mode: null,
    telemetry: null,
  };
  const res = await call("/v1/admin/live-status");
  if (!res || !res.ok) return base;
  try {
    const data = (await res.json()) as {
      mode?: "LIVE" | "DEMO";
      members?: Array<{
        memberId: string;
        online: boolean;
        status: string;
        statusLabel: string;
        lotRule: string;
        secondsSinceSeen: number | null;
        telemetry: AccountTelemetry | null;
      }>;
    };
    const me = (data.members ?? []).find((m) => m.memberId === userId);
    if (!me) return { ...base, mode: data.mode ?? null };
    return {
      ...base,
      registered: true,
      online: me.online,
      status: me.status,
      statusLabel: me.statusLabel,
      lotRule: me.lotRule,
      secondsSinceSeen: me.secondsSinceSeen,
      mode: data.mode ?? null,
      telemetry: me.telemetry ?? null,
    };
  } catch {
    return base;
  }
}

// Returns the member's access key if the bridge is in paid mode and they are
// registered + eligible; otherwise null (so the page shows a provisioning note).
export async function getMemberAccessKey(userId: string): Promise<string | null> {
  const res = await call("/v1/admin/access-keys", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ memberId: userId }),
  });
  if (!res || !res.ok) return null;
  try {
    const data = (await res.json()) as { accessKey?: string };
    return data.accessKey ?? null;
  } catch {
    return null;
  }
}
