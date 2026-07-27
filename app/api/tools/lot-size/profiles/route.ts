/**
 * VIP saved account profiles.
 *   GET  -> list the caller's profiles
 *   POST -> create a profile
 * No broker/MT5 credentials are ever accepted or stored.
 */

import { jsonResponse, parseRequestBody, safeText } from "@/lib/api-utils";
import { requireVip } from "@/lib/tools/vip-guard";
import { listProfiles, createProfile } from "@/lib/tools/lot-size-store";
import { isRiskModeId } from "@/lib/config/risk-modes";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const ctx = await requireVip(request);
  if (ctx instanceof Response) return ctx;
  const profiles = await listProfiles(ctx.prisma, ctx.userId);
  return jsonResponse(200, { profiles });
}

export async function POST(request: Request): Promise<Response> {
  const ctx = await requireVip(request);
  if (ctx instanceof Response) return ctx;

  let fields: Record<string, unknown>;
  try {
    const parsed = await parseRequestBody(request);
    fields = parsed.fields as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { message: "Invalid request body." });
  }

  const label = safeText(fields.label, 60);
  const accountCurrency = safeText(fields.accountCurrency, 3).toUpperCase();
  const leverage = Number(fields.leverage);
  if (!label) return jsonResponse(400, { message: "A profile name is required." });
  if (!/^[A-Z]{3}$/.test(accountCurrency)) return jsonResponse(400, { message: "A valid account currency is required." });
  if (!Number.isFinite(leverage) || leverage <= 0) return jsonResponse(400, { message: "A valid leverage is required." });

  const defaultEquityRaw = Number(fields.defaultEquity);
  const defaultRiskMode = safeText(fields.defaultRiskMode, 10);

  const result = await createProfile(ctx.prisma, ctx.userId, {
    label,
    accountCurrency,
    leverage: Math.round(leverage),
    brokerName: fields.brokerName ? safeText(fields.brokerName, 60) : null,
    accountType: fields.accountType ? safeText(fields.accountType, 30) : null,
    defaultEquity: Number.isFinite(defaultEquityRaw) && defaultEquityRaw > 0 ? defaultEquityRaw : null,
    defaultRiskMode: isRiskModeId(defaultRiskMode) ? defaultRiskMode : null,
  });

  if (!result.ok) {
    if (result.reason === "limit_reached") return jsonResponse(409, { message: "You have reached the maximum number of saved profiles." });
    return jsonResponse(503, { message: "Saved profiles are not available yet. Please try again later." });
  }

  return jsonResponse(201, { id: result.profile.id });
}
