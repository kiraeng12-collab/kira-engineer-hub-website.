/**
 * KIRA Lot Sizing Calculator API.
 *
 *   GET  /api/tools/lot-size  -> metadata (instruments + risk modes for the tier)
 *   POST /api/tools/lot-size  -> run a calculation
 *
 * All sizing math runs server-side in the shared engine. The caller's access
 * tier is resolved from the session and entitlements here — never trusted from
 * the request body — so VIP-only features cannot be unlocked by a crafted
 * payload. The endpoint is public (free calculations need no account); VIP
 * fields simply activate when an authenticated VIP calls it.
 */

import { jsonResponse, parseRequestBody } from "@/lib/api-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { calculateKiraLotSize } from "@/lib/lot-sizing-engine";
import { parseLotSizeRequest } from "@/lib/tools/lot-size-request";
import { resolveCaller } from "@/lib/tools/resolve-caller";
import { saveCalculation } from "@/lib/tools/lot-size-store";
import { instrumentOptions } from "@/lib/config/instruments";
import { availableRiskModes } from "@/lib/config/risk-modes";

export const runtime = "nodejs";

function ipHint(request: Request): string {
  const value = request.headers.get("x-forwarded-for") || "";
  return value.split(",")[0]?.trim() ?? "";
}

export async function GET(request: Request): Promise<Response> {
  const { access } = await resolveCaller(request);
  return jsonResponse(200, {
    access,
    instruments: instrumentOptions(),
    riskModes: availableRiskModes(access).map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      riskPercent: m.riskPercent,
      stressMultiplier: m.stressMultiplier,
      maxMarginUsagePercent: m.maxMarginUsagePercent,
    })),
  });
}

export async function POST(request: Request): Promise<Response> {
  const { access, userId, prisma } = await resolveCaller(request);

  // The calculator is VIP-only: only active KIRA VIP members (verified by live
  // VIP-group membership in Telegram, or the vip_telegram entitlement on the
  // website) may run a calculation. Everyone else is locked out.
  if (access !== "vip") {
    return jsonResponse(403, {
      locked: true,
      message: "The KIRA Lot Sizing Calculator is available to KIRA VIP members.",
    });
  }

  // Rate limit anonymous abuse by IP. Generous — the calc is cheap and pure —
  // but enough to stop a scripted flood.
  if (prisma) {
    const ip = ipHint(request);
    if (ip) {
      const limit = await checkRateLimit(prisma, { bucket: `lotsize:ip:${ip}`, windowMinutes: 1, max: 60 });
      if (limit.limited) return jsonResponse(429, { message: "Too many calculations. Please slow down." });
    }
  }

  let fields: unknown;
  try {
    const parsed = await parseRequestBody(request);
    fields = parsed.fields;
  } catch {
    return jsonResponse(400, { message: "Invalid request body." });
  }

  const parsed = parseLotSizeRequest(fields, access);
  if (!parsed.ok) {
    return jsonResponse(400, { message: "Some inputs are invalid.", errors: parsed.errors });
  }

  const result = calculateKiraLotSize(parsed.input);

  // History is a VIP feature: persist only for an authenticated VIP, and never
  // let a storage failure affect the calculation response.
  let calculationId: string | null = null;
  if (access === "vip" && userId && prisma) {
    calculationId = await saveCalculation(prisma, userId, parsed.input, result);
  }

  return jsonResponse(200, {
    access,
    droppedVipFields: parsed.droppedVipFields,
    calculationId,
    result,
  });
}
