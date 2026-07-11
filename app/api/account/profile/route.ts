import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { jsonResponse, safeText, parseRequestBody } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return jsonResponse(401, { message: "You must be signed in." });

  const prisma = getPrismaClient();
  if (!prisma) return jsonResponse(503, { message: "Account updates are not configured yet." });

  try {
    const { fields } = await parseRequestBody(request);
    const name = safeText(fields.name, 200);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name || null },
    });

    return jsonResponse(200, { updated: true });
  } catch {
    return jsonResponse(400, { message: "The request could not be processed safely." });
  }
}
