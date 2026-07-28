import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { awardBid, getProject } from "@/lib/kpn";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const bid = await prisma.kpnProjectBid.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!bid) return errorResponse("Bid not found", 404);
    if (bid.project.customerId !== user!.id) return errorResponse("Unauthorized", 403);
    if (bid.status !== "pending") return errorResponse("Bid is not pending", 400);

    const awarded = await awardBid(id);
    return successResponse(awarded);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
