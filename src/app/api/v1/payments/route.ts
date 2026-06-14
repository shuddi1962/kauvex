import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  getAuthUser,
  validateBody,
} from "@/lib/api-helpers";
import { processPayment } from "@/lib/payments";
import { z } from "zod";

export const dynamic = "force-dynamic";

const processPaymentSchema = z.object({
  orderId: z.string().min(1),
  gateway: z.enum(["stripe", "paystack", "flutterwave", "paypal"]),
  returnUrl: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;
    const orderId = searchParams.get("orderId") || "";
    const gateway = searchParams.get("gateway") || "";
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";

    const where: Record<string, unknown> = {};
    if (orderId) where.orderId = orderId;
    if (gateway) where.gateway = gateway;
    if (status) where.status = status;
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.paymentTransaction.count({ where }),
    ]);

    return paginatedResponse(transactions, total, page, limit);
  } catch {
    return errorResponse("Failed to fetch payments", 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, processPaymentSchema);
  if (valErr) return valErr;

  try {
    const order = await prisma.order.findUnique({
      where: { id: body!.orderId },
    });
    if (!order) return errorResponse("Order not found", 404);

    const isOwner = order.customerId === user!.id;
    if (!isOwner) return errorResponse("Access denied", 403);

    if (order.paymentStatus === "paid" || order.paymentStatus === "completed") {
      return errorResponse("Order is already paid", 422);
    }

    const paymentIntent = await processPayment(
      {
        id: order.id,
        total: Number(order.total),
        currency: order.currency || "USD",
        customerEmail: user!.email,
        customerId: user!.id,
        metadata: { returnUrl: body!.returnUrl },
        description: `Payment for order ${order.orderNumber || order.id}`,
      },
      body!.gateway,
      body!.returnUrl,
    );

    return successResponse(paymentIntent as unknown as Record<string, unknown>, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
