"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { getPrismaClient } from "@/lib/db/prisma";
import { hasEntitlement } from "@/lib/entitlements/service";
import { saveCopySettings, type CopySettings } from "@/lib/copy-bridge/settings";

export type SaveState = { ok: boolean; message: string };

const MODES = new Set<CopySettings["lotSizingMode"]>(["SAME", "MULTIPLY", "REDUCE"]);

export async function updateCopySettings(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getServerSession(authOptions);
  const prisma = getPrismaClient();
  if (!prisma || !session?.user?.id) return { ok: false, message: "Please sign in again." };

  // Defense in depth: only entitled members may change copy settings.
  if (!(await hasEntitlement(prisma, session.user.id, "copy_trading"))) {
    return { ok: false, message: "Copy Trading is not active on your plan." };
  }

  const rawMode = String(formData.get("lotSizingMode") ?? "SAME");
  const mode = MODES.has(rawMode as CopySettings["lotSizingMode"]) ? (rawMode as CopySettings["lotSizingMode"]) : "SAME";
  const multiplier = Number(formData.get("lotMultiplier"));
  const maxLot = Number(formData.get("maxLot"));

  if (!Number.isFinite(multiplier) || multiplier <= 0) return { ok: false, message: "Enter a valid multiplier." };
  if (!Number.isFinite(maxLot) || maxLot <= 0) return { ok: false, message: "Enter a valid maximum lot." };

  // The bridge clamps to the owner ceilings and returns what it actually applied.
  const applied = await saveCopySettings(session.user.id, { lotSizingMode: mode, lotMultiplier: multiplier, maxLot });
  if (!applied) return { ok: false, message: "Could not save right now. Please try again shortly." };

  revalidatePath("/account/copy-trading");
  const note =
    applied.lotMultiplier !== multiplier || applied.maxLot !== maxLot
      ? ` (adjusted to your plan limits: ×${applied.lotMultiplier}, max ${applied.maxLot} lots)`
      : "";
  return { ok: true, message: `Saved${note}.` };
}
