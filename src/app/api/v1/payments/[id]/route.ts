import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import {
  successResponse,
  errorResponse,
  getAuthUser,
  validateBody,
} from "@/lib/api-helpers";

import { getGateway } from "@/lib/payments";
import { z } from "zod";

export const dynamic = "force-dynamic";

const refundSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const { id } = params;

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id },
    });
    if (!transaction) return errorResponse("Payment not found", 404);

    const isOwner =
      transaction.customerId === user!.id ||
      transaction.vendorId === user!.id;
    if (!isOwner) return errorResponse("Access denied", 403);

    return successResponse(transaction as unknown as Record<string, unknown>);
  } catch {
    return errorResponse("Failed to fetch payment", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const isAdmin = profile?.role && ["super-admin", "store-manager", "finance-admin"].includes(profile.role);
  if (!isAdmin) return errorResponse("Admin access required", 403);

  const { data: body, error: valErr } = await validateBody(request, refundSchema);
  if (valErr) return valErr;

  try {
    const { id } = params;

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id },
    });
    if (!transaction) return errorResponse("Payment not found", 404);

    if (transaction.status !== "completed") {
      return errorResponse("Only completed payments can be refunded", 422);
    }

    if (transaction.type !== "payment") {
      return errorResponse("This transaction is not a payment", 422);
    }

    const gateway = getGateway(transaction.gateway);
    const refundRef = transaction.gatewayRef;
    if (!refundRef) return errorResponse("No gateway reference found", 400);

    const refundResult = await gateway.processRefund(
      refundRef,
      body?.amount ? Number(body.amount) : undefined,
    );

    await prisma.paymentTransaction.update({
      where: { id },
      data: { status: "refunded", gatewayStatus: refundResult.status },
    });

    await prisma.paymentTransaction.create({
      data: {
        orderId: transaction.orderId,
        customerId: transaction.customerId,
        vendorId: transaction.vendorId,
        amount: -(refundResult.amount || Number(transaction.amount)),
        currency: transaction.currency,
        gateway: transaction.gateway,
        gatewayRef: refundResult.refundId,
        gatewayStatus: refundResult.status,
        type: "refund",
        status: refundResult.success ? "completed" : "failed",
        description: body?.reason || `Refund for payment ${id}`,
        metadata: { originalPaymentId: id, refundId: refundResult.refundId },
      },
    });

    return successResponse(refundResult as unknown as Record<string, unknown>);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
