import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { fundEscrow } from "@/lib/manufacturers/escrow";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createOrderSchema = z.object({
  manufacturerId: z.string().uuid(),
  quoteId: z.string().uuid().optional(),
  totalValue: z.number().positive(),
  currency: z.string().max(10).default("USD"),
  depositPercent: z.number().min(0).max(100).default(30),
  milestoneStructure: z.array(z.object({
    label: z.string(),
    percent: z.number().min(1).max(100),
  })).optional(),
}).strict();

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const manufacturerId = searchParams.get("manufacturerId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (manufacturerId) where.manufacturerId = manufacturerId;
    else where.buyerId = user!.id;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.mfgOrder.findMany({
        where,
        include: {
          escrow: { select: { status: true, totalAmount: true, releasedAmount: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.mfgOrder.count({ where }),
    ]);

    return successResponse({
      results: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createOrderSchema);
  if (valErr) return valErr;

  try {
    const order = await prisma.mfgOrder.create({
      data: {
        buyerId: user!.id,
        manufacturerId: body!.manufacturerId,
        quoteId: body!.quoteId ?? null,
        totalValue: body!.totalValue,
        currencyCode: body!.currency,
        depositPercent: body!.depositPercent,
        milestoneStructure: body!.milestoneStructure as unknown as Record<string, unknown>[] | undefined,
        status: "pending",
        currentStage: "confirmed",
      },
    });

    const depositAmount = Math.round(body!.totalValue * body!.depositPercent / 100 * 100) / 100;
    await fundEscrow(order.id, depositAmount);

    return successResponse(order, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
