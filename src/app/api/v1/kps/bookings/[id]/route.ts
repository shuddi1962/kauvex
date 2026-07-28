import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { updateBookingStatus } from "@/lib/kpn";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateStatusSchema = z.object({
  status: z.enum([
    "pending", "professional_assigned", "professional_en_route",
    "checked_in", "in_progress", "completed", "cancelled", "disputed",
  ]),
  notes: z.string().max(2000).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.kpsServiceBooking.findUnique({
      where: { id },
      include: { professional: true },
    });
    if (!booking) return errorResponse("Booking not found", 404);
    return successResponse(booking);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, updateStatusSchema);
  if (valErr) return valErr;

  try {
    const { id } = await params;
    const booking = await prisma.kpsServiceBooking.findUnique({ where: { id } });
    if (!booking) return errorResponse("Booking not found", 404);

    const updated = await updateBookingStatus(id, body!.status, {
      ...(body!.notes ? { adminNotes: body!.notes } : {}),
    });
    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
