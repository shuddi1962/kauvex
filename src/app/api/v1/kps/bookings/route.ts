import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { createServiceBooking, getCustomerBookings, getProfessionalBookings, getProfessional } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createBookingSchema = z.object({
  orderId: z.string().optional(),
  serviceType: z.string().min(1).max(100),
  productId: z.string().optional(),
  serviceAddress: z.any().optional(),
  scheduledDate: z.string().optional(),
  scheduledTimeWindow: z.string().max(50).optional(),
  estimatedDurationHours: z.number().min(0).optional(),
  serviceFee: z.number().min(0),
  currencyCode: z.string().max(10).optional(),
  notes: z.string().max(2000).optional(),
});

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "customer";

    if (role === "professional") {
      const professional = await getProfessional(user!.id);
      if (!professional) return errorResponse("Professional profile not found", 404);
      const bookings = await getProfessionalBookings(professional.id);
      return successResponse(bookings);
    }

    const bookings = await getCustomerBookings(user!.id);
    return successResponse(bookings);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createBookingSchema);
  if (valErr) return valErr;

  try {
    const booking = await createServiceBooking({
      ...body!,
      customerId: user!.id,
    });
    return successResponse(booking, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
