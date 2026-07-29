import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });

    if (!business) {
      return errorResponse("Business not found", 404);
    }

    const subscription = await prisma.kaiSubscription.findFirst({
      where: { businessId: business.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(subscription);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });

    if (!business) {
      return errorResponse("Business not found. Create a business first.", 404);
    }

    const body = await request.json();
    const { planId, billingCycle } = body;

    if (!planId) {
      return errorResponse("planId is required", 400);
    }

    const plan = await prisma.kaiPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return errorResponse("Plan not found or inactive", 404);
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription = await prisma.kaiSubscription.upsert({
      where: {
        id: (
          await prisma.kaiSubscription.findFirst({
            where: { businessId: business.id },
            orderBy: { createdAt: "desc" },
            select: { id: true },
          })
        )?.id ?? "",
      },
      update: {
        planId,
        billingCycle: billingCycle ?? "monthly",
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelledAt: null,
        autoRenew: true,
      },
      create: {
        businessId: business.id,
        planId,
        billingCycle: billingCycle ?? "monthly",
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        autoRenew: true,
      },
      include: { plan: true },
    });

    return successResponse(subscription, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
