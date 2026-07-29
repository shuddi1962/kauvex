import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const { id } = params;

    const transfer = await prisma.kv_digital_passport_transfers.findUnique({
      where: { id },
      include: {
        passport: true,
      },
    });
    if (!transfer) return errorResponse("Transfer not found", 404);

    if (
      transfer.fromOwnerId !== user!.id &&
      transfer.toOwnerId !== user!.id
    ) {
      return errorResponse("Access denied", 403);
    }

    return successResponse(transfer);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["completed", "approved", "rejected"].includes(status)) {
      return errorResponse("Status must be 'completed', 'approved', or 'rejected'", 400);
    }

    const transfer = await prisma.kv_digital_passport_transfers.findUnique({
      where: { id },
    });
    if (!transfer) return errorResponse("Transfer not found", 404);

    if (
      transfer.fromOwnerId !== user!.id &&
      transfer.toOwnerId !== user!.id
    ) {
      return errorResponse("Access denied", 403);
    }

    if (transfer.status !== "pending") {
      return errorResponse("Transfer has already been processed", 400);
    }

    const updateData: Record<string, unknown> = { status };
    const eventType =
      status === "completed" || status === "approved" ? "transfer_completed" : "transfer_rejected";
    const eventTitle =
      status === "completed" || status === "approved"
        ? "Ownership Transfer Completed"
        : "Ownership Transfer Rejected";

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.kv_digital_passport_transfers.update({
      where: { id },
      data: updateData,
    });

    if (status === "completed" && transfer.toOwnerId) {
      const passport = await prisma.kv_digital_passports.findUnique({
        where: { id: transfer.passportId },
      });
      if (passport) {
        const currentScore = passport.trustScore ? Number(passport.trustScore) : 50;
        const newScore = Math.min(100, Math.max(0, currentScore + 2));
        await prisma.kv_digital_passports.update({
          where: { id: transfer.passportId },
          data: {
            ownerId: transfer.toOwnerId,
            trustScore: newScore,
          },
        });
      }
    }

    await prisma.kv_digital_passport_events.create({
      data: {
        passportId: transfer.passportId,
        eventType,
        title: eventTitle,
        description: `Transfer ${status} from ${transfer.fromOwnerId} to ${transfer.toOwnerId}`,
        performedBy: user!.id,
        metadata: { transferId: id, status },
      },
    });

    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
