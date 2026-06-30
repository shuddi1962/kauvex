import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { createDispute, listDisputes } from "@/lib/manufacturers/disputes";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createDisputeSchema = z.object({
  orderId: z.string().uuid(),
  disputeType: z.enum(["quality", "quantity", "late_delivery", "wrong_spec", "customization_mismatch"]),
  description: z.string().min(10).max(2000),
  evidenceUrls: z.array(z.string().url()).optional(),
}).strict();

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const status = searchParams.get("status");

    const disputes = await listDisputes(orderId || undefined, status || undefined);

    // Filter to only disputes where user is buyer or manufacturer
    const { data: profile } = await prisma.profiles.findUnique({
      where: { id: user!.id },
      select: { vendor_id: true },
    });

    const manufacturerId = profile?.vendor_id;
    const filtered = disputes.filter((d) => {
      return d.order.buyer_id === user!.id || d.order.manufacturer_id === manufacturerId;
    });

    return successResponse(filtered);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createDisputeSchema);
  if (valErr) return valErr;

  try {
    // Verify the user is associated with the order
    const order = await prisma.mfgOrder.findUnique({
      where: { id: body!.orderId },
      select: { buyer_id: true, manufacturer_id: true },
    });

    if (!order) return errorResponse("Order not found", 404);

    const { data: profile } = await prisma.profiles.findUnique({
      where: { id: user!.id },
      select: { vendor_id: true },
    });

    const manufacturerId = profile?.vendor_id;
    const isBuyer = order.buyer_id === user!.id;
    const isManufacturer = manufacturerId && order.manufacturer_id === manufacturerId;

    if (!isBuyer && !isManufacturer) {
      return errorResponse("You are not associated with this order", 403);
    }

    const dispute = await createDispute({
      orderId: body!.orderId,
      raisedBy: user!.id,
      disputeType: body!.disputeType,
      description: body!.description,
      evidenceUrls: body!.evidenceUrls,
    });

    return successResponse(dispute, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
