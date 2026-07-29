import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = params;
    const body = await request.json();
    const { toOwnerId, transferType, metadata } = body;

    if (!toOwnerId) {
      return errorResponse("toOwnerId is required", 400);
    }

    const passport = await prisma.kv_digital_passports.findUnique({
      where: { id },
    });
    if (!passport) return errorResponse("Passport not found", 404);

    if (passport.ownerId !== user!.id) {
      return errorResponse("Only the current owner can initiate a transfer", 403);
    }

    const transfer = await prisma.kv_digital_passport_transfers.create({
      data: {
        passportId: id,
        fromOwnerId: passport.ownerId,
        toOwnerId,
        transferType: transferType || "sale",
        status: "pending",
        metadata: metadata || {},
      },
    });

    await prisma.kv_digital_passport_events.create({
      data: {
        passportId: id,
        eventType: "transfer_initiated",
        title: "Ownership Transfer Initiated",
        description: `Transfer to owner ${toOwnerId} initiated (${transferType || "sale"})`,
        performedBy: user!.id,
        metadata: { transferId: transfer.id, transferType: transferType || "sale" },
      },
    });

    return successResponse(transfer, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
