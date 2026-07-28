import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse, getAuthUser } from "@/lib/api-helpers";
import { z } from "zod";

const createReturnSchema = z.object({
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  photos: z.array(z.string().url()).max(10).optional(),
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  let body;
  try {
    body = createReturnSchema.parse(await request.json());
  } catch (err: unknown) {
    if (err instanceof z.ZodError) return errorResponse("Validation failed", 422, err.issues);
    return errorResponse("Invalid JSON body", 400);
  }

  try {
    const order = await (prisma as any).order.findUnique({
      where: { id: body.orderId },
      select: { id: true, customerId: true, vendorId: true, orderNumber: true },
    });

    if (!order) return errorResponse("Order not found", 404);
    if (order.customerId !== user!.id) return errorResponse("Not authorized to create return for this order", 403);

    const existingReturn = await (prisma as any).dispute.findFirst({
      where: { orderId: body.orderId, customerId: user!.id, status: { in: ["pending", "open", "investigating"] } },
    });
    if (existingReturn) return errorResponse("An active return request already exists for this order", 409);

    const ret = await (prisma as any).dispute.create({
      data: {
        orderId: body.orderId,
        customerId: user!.id,
        vendorId: order.vendorId,
        type: "return",
        status: "pending",
        description: `Product: ${body.productId}\nReason: ${body.reason}${body.description ? `\nDetails: ${body.description}` : ""}`,
        customerEvidence: body.photos ? JSON.stringify(body.photos) : null,
      },
    });

    return successResponse(ret, 201);
  } catch (err) {
    console.error("Create return error:", err);
    return errorResponse("Internal server error", 500);
  }
}

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;

    const [returns, total] = await Promise.all([
      (prisma as any).dispute.findMany({
        where: { customerId: user!.id, type: "return" },
        orderBy: { openedAt: "desc" },
        skip: offset,
        take: limit,
      }),
      (prisma as any).dispute.count({
        where: { customerId: user!.id, type: "return" },
      }),
    ]);

    return paginatedResponse(returns || [], total, page, limit);
  } catch (err) {
    console.error("List returns error:", err);
    return errorResponse("Internal server error", 500);
  }
}