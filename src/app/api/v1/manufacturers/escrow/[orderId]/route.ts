import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { getEscrowByOrder, releaseEscrowMilestone } from "@/lib/manufacturers/escrow";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const releaseMilestoneSchema = z.object({
  milestoneIndex: z.number().int().min(0),
  reason: z.string().min(1).max(500),
}).strict();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { orderId } = await params;
    const escrow = await getEscrowByOrder(orderId);
    if (!escrow) return errorResponse("Escrow not found", 404);

    // Verify user owns this order's manufacturer
    const { data: profile } = await prisma.profiles.findUnique({
      where: { id: user!.id },
      select: { vendor_id: true },
    });

    const manufacturerId = profile?.vendor_id;
    if (escrow.order && manufacturerId && escrow.order.manufacturer_id !== manufacturerId) {
      const order = await prisma.mfgOrder.findUnique({
        where: { id: orderId },
        select: { manufacturer_id: true },
      });
      if (order && order.manufacturer_id !== manufacturerId) {
        return errorResponse("You do not have access to this escrow", 403);
      }
    }

    return successResponse(escrow);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, releaseMilestoneSchema);
  if (valErr) return valErr;

  try {
    const { orderId } = await params;

    // Verify manufacturer ownership
    const { data: profile } = await prisma.profiles.findUnique({
      where: { id: user!.id },
      select: { vendor_id: true },
    });

    const manufacturerId = profile?.vendor_id;
    const order = await prisma.mfgOrder.findUnique({
      where: { id: orderId },
      select: { manufacturer_id: true },
    });

    if (!order) return errorResponse("Order not found", 404);
    if (manufacturerId && order.manufacturer_id !== manufacturerId) {
      return errorResponse("You do not have access to this escrow", 403);
    }

    const updatedEscrow = await releaseEscrowMilestone(
      orderId,
      body!.milestoneIndex,
      body!.reason
    );

    return successResponse(updatedEscrow);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
