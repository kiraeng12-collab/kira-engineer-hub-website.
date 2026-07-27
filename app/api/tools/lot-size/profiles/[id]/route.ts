/**
 * Delete a VIP saved account profile. The delete is scoped to the caller's own
 * userId in the store layer, so one member can never delete another's profile
 * (IDOR-safe).
 */

import { jsonResponse } from "@/lib/api-utils";
import { requireVip } from "@/lib/tools/vip-guard";
import { deleteProfile } from "@/lib/tools/lot-size-store";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const ctx = await requireVip(request);
  if (ctx instanceof Response) return ctx;

  const { id } = await params;
  if (!id) return jsonResponse(400, { message: "A profile id is required." });

  const deleted = await deleteProfile(ctx.prisma, ctx.userId, id);
  if (!deleted) return jsonResponse(404, { message: "Profile not found." });
  return jsonResponse(200, { deleted: true });
}
