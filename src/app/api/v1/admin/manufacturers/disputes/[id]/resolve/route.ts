import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin, validateBody } from "@/lib/api-helpers";
import { resolveDispute } from "@/lib/manufacturers/disputes";
import { disputeEscrow } from "@/lib/manufacturers/escrow";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const resolveDisputeSchema = z.object({
  resolution: z.enum(["full_refund", "partial_refund", "rework", "rejected"]),
  notes: z.string().max(1000).optional(),
}).strict();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, resolveDisputeSchema);
  if (valErr) return valErr;

  try {
    const { id } = await params;

    const dispute = await prisma.mfgDispute.findUnique({
      where: { id },
      select: { id: true, status: true, order_id: true },
    });

    if (!dispute) return errorResponse("Dispute not found", 404);
    if (dispute.status === "resolved") return errorResponse("Dispute is already resolved", 400);

    const resolved = await resolveDispute(
      id,
      body!.resolution,
      user!.id,
      body!.notes
    );

    // If full refund, release all escrow
    if (body!.resolution === "full_refund" && dispute.order_id) {
      await disputeEscrow(dispute.order_id, id);
    }

    // If partial refund, mark escrow as disputed for manual review
    if (body!.resolution === "partial_refund" && dispute.order_id) {
      await disputeEscrow(dispute.order_id, id);
    }

    return successResponse(resolved);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
