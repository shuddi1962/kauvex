import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import {
  successResponse,
  errorResponse,
  getAuthUser,
  validateBody,
} from "@/lib/api-helpers";
import {
  holdPayment,
  releasePayment,
  refundFromEscrow,
  getEscrowStatus,
} from "@/lib/payments/escrow";
import { z } from "zod";

export const dynamic = "force-dynamic";

const holdPaymentSchema = z.object({
  orderId: z.string().min(1),
  vendorId: z.string().min(1),
  customerId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
});

const releasePaymentSchema = z.object({
  escrowId: z.string().min(1),
});

const refundEscrowSchema = z.object({
  escrowId: z.string().min(1),
});

const escrowStatusSchema = z.object({
  orderId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) return errorResponse("orderId query parameter is required", 400);

    const escrows = await getEscrowStatus(orderId);

    const isParticipant = escrows.some(
      (e) => e.customerId === user!.id || e.vendorId === user!.id,
    );
    if (!isParticipant) return errorResponse("Access denied", 403);

    return successResponse(escrows);
  } catch {
    return errorResponse("Failed to fetch escrow status", 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const action = request.nextUrl.searchParams.get("action") || "hold";

  switch (action) {
    case "hold": {
      const { data: body, error: valErr } = await validateBody(request, holdPaymentSchema);
      if (valErr) return valErr;

      try {
        const escrow = await holdPayment(
          body!.orderId,
          body!.vendorId,
          body!.customerId,
          body!.amount,
          body!.currency,
        );
        return successResponse(escrow as unknown as Record<string, unknown>, 201);
      } catch (err) {
        return errorResponse((err as Error).message, 400);
      }
    }

    case "release": {
      const { data: body, error: valErr } = await validateBody(request, releasePaymentSchema);
      if (valErr) return valErr;

      const escrow = await prisma.escrow.findUnique({ where: { id: body!.escrowId } });
      if (!escrow) return errorResponse("Escrow not found", 404);

      const isCustomer = escrow.customerId === user!.id;
      const isAdmin = profile?.role && ["super-admin", "finance-admin"].includes(profile.role);
      if (!isCustomer && !isAdmin) return errorResponse("Only the customer or admin can release escrow", 403);

      try {
        const result = await releasePayment(body!.escrowId);
        return successResponse(result as unknown as Record<string, unknown>);
      } catch (err) {
        return errorResponse((err as Error).message, 400);
      }
    }

    case "refund": {
      const { data: body, error: valErr } = await validateBody(request, refundEscrowSchema);
      if (valErr) return valErr;

      const escrow = await prisma.escrow.findUnique({ where: { id: body!.escrowId } });
      if (!escrow) return errorResponse("Escrow not found", 404);

      const isCustomer = escrow.customerId === user!.id;
      const isAdmin = profile?.role && ["super-admin", "finance-admin"].includes(profile.role);
      if (!isCustomer && !isAdmin) return errorResponse("Only the customer or admin can refund escrow", 403);

      try {
        const result = await refundFromEscrow(body!.escrowId);
        return successResponse(result as unknown as Record<string, unknown>);
      } catch (err) {
        return errorResponse((err as Error).message, 400);
      }
    }

    default:
      return errorResponse(`Unknown action: ${action}. Use: hold, release, refund`, 400);
  }
}
