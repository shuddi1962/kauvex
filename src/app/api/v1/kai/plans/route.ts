import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      const { user, error: authErr } = await requireAdmin(request);
      if (authErr) return authErr;

      const plans = await prisma.kaiPlan.findMany({
        orderBy: { sortOrder: "asc" },
      });
      return successResponse(plans);
    }

    const plans = await prisma.kaiPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return successResponse(plans);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { id, action, name, slug, description, priceMonthly, priceYearly, maxAgents, maxKbSizeMb, features, isActive, sortOrder } = body;

    if (action === "update" && id) {
      const updated = await prisma.kaiPlan.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(slug !== undefined && { slug }),
          ...(description !== undefined && { description }),
          ...(priceMonthly !== undefined && { priceMonthly }),
          ...(priceYearly !== undefined && { priceYearly }),
          ...(maxAgents !== undefined && { maxAgents }),
          ...(maxKbSizeMb !== undefined && { maxKbSizeMb }),
          ...(features !== undefined && { features }),
          ...(isActive !== undefined && { isActive }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
      });
      return successResponse(updated);
    }

    if (!name || !slug) {
      return errorResponse("name and slug are required", 400);
    }

    const plan = await prisma.kaiPlan.create({
      data: {
        name,
        slug,
        description: description ?? null,
        priceMonthly: priceMonthly ?? 0,
        priceYearly: priceYearly ?? null,
        maxAgents: maxAgents ?? 1,
        maxKbSizeMb: maxKbSizeMb ?? 100,
        features: features ?? [],
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });
    return successResponse(plan, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}