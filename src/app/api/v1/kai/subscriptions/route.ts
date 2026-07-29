import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      const { user: admin, error: adminErr } = await requireAdmin(request);
      if (adminErr) return adminErr;

      const subscriptions = await prisma.kaiSubscription.findMany({
        include: { business: true, plan: true },
        orderBy: { createdAt: "desc" },
      });
      return successResponse(subscriptions);
    }

    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });

    if (!business) {
      return successResponse(null);
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
    const body = await request.json();
    const { planId, billingCycle, id: subId, action } = body;

    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });

    if (!business) {
      return errorResponse("Business not found. Create a business first.", 404);
    }

    if (action === "cancel" && subId) {
      const sub = await prisma.kaiSubscription.findUnique({ where: { id: subId } });
      if (!sub || sub.businessId !== business.id) {
        return errorResponse("Subscription not found", 404);
      }
      const updated = await prisma.kaiSubscription.update({
        where: { id: subId },
        data: { status: "cancelled", cancelledAt: new Date(), autoRenew: false },
        include: { plan: true },
      });
      return successResponse(updated);
    }

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

export async function PATCH(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { id, status, autoRenew, billingCycle } = body;

    const sub = await prisma.kaiSubscription.findUnique({ where: { id } });
    if (!sub) return errorResponse("Subscription not found", 404);

    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });
    if (!business || sub.businessId !== business.id) {
      return errorResponse("Unauthorized", 403);
    }

    const updated = await prisma.kaiSubscription.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(autoRenew !== undefined && { autoRenew }),
        ...(billingCycle !== undefined && { billingCycle }),
        ...(status === "cancelled" && { cancelledAt: new Date() }),
      },
      include: { plan: true },
    });

    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("id is required", 400);

    const sub = await prisma.kaiSubscription.findUnique({ where: { id } });
    if (!sub) return errorResponse("Subscription not found", 404);

    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });
    if (!business || sub.businessId !== business.id) {
      return errorResponse("Unauthorized", 403);
    }

    await prisma.kaiSubscription.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}