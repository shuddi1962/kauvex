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

      const agents = await prisma.kaiAgent.findMany({
        include: { permissions: true, business: true },
        orderBy: { createdAt: "desc" },
      });
      return successResponse(agents);
    }

    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });

    if (!business) {
      return successResponse([]);
    }

    const agents = await prisma.kaiAgent.findMany({
      where: { businessId: business.id },
      include: { permissions: true },
      orderBy: { createdAt: "asc" },
    });

    return successResponse(agents);
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
    const { name, role, avatar, color, description, systemPrompt, knowledgeScope, model, temperature, isActive, permissions } = body;

    if (!name || !role) {
      return errorResponse("name and role are required", 400);
    }

    const agent = await prisma.kaiAgent.create({
      data: {
        businessId: business.id,
        name,
        role,
        avatar: avatar ?? null,
        color: color ?? null,
        description: description ?? null,
        systemPrompt: systemPrompt ?? null,
        knowledgeScope: knowledgeScope ?? "business",
        model: model ?? "openai/gpt-4o-mini",
        temperature: temperature ?? 0.7,
        isActive: isActive ?? true,
        permissions: permissions
          ? {
              create: permissions.map((p: { resourceType: string; canView?: boolean; canCreate?: boolean; canEdit?: boolean; canDelete?: boolean }) => ({
                resourceType: p.resourceType,
                canView: p.canView ?? false,
                canCreate: p.canCreate ?? false,
                canEdit: p.canEdit ?? false,
                canDelete: p.canDelete ?? false,
              })),
            }
          : undefined,
      },
      include: { permissions: true },
    });

    return successResponse(agent, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
