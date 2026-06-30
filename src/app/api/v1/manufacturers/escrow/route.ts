import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { getEscrowSummary } from "@/lib/manufacturers/escrow";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { data: profile } = await prisma.profiles.findUnique({
      where: { id: user!.id },
      select: { vendor_id: true },
    });

    const manufacturerId = profile?.vendor_id;
    if (!manufacturerId) {
      return errorResponse("No manufacturer profile linked to this account", 404);
    }

    const summary = await getEscrowSummary(manufacturerId);
    return successResponse(summary);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
