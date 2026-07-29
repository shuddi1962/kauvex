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
      const { error: adminErr } = await requireAdmin(request);
      if (adminErr) return adminErr;

      const workflows = await prisma.kaiWorkflow.findMany({
        include: {
          steps: { orderBy: { stepOrder: "asc" } },
          business: { select: { companyName: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return successResponse(workflows);
    }

    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });
    if (!business) return errorResponse("Business not found", 404);

    const workflows = await prisma.kaiWorkflow.findMany({
      where: { businessId: business.id },
      include: {
        steps: { orderBy: { stepOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(workflows);
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
    if (!business) return errorResponse("Business not found", 404);

    const body = await request.json();
    const { name, description, triggerType, triggerConfig } = body;

    if (!name || !triggerType) {
      return errorResponse("name and triggerType are required", 400);
    }

    const workflow = await prisma.kaiWorkflow.create({
      data: {
        businessId: business.id,
        name,
        description: description ?? null,
        triggerType,
        triggerConfig: triggerConfig ?? {},
      },
      include: { steps: { orderBy: { stepOrder: "asc" } } },
    });

    return successResponse(workflow, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
