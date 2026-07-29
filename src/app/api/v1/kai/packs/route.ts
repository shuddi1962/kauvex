import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      const { error: adminErr } = await requireAdmin(request);
      if (adminErr) return adminErr;

      const packs = await prisma.kaiIndustryPack.findMany({
        orderBy: { sortOrder: "asc" },
      });
      return successResponse(packs);
    }

    const packs = await prisma.kaiIndustryPack.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return successResponse(packs);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { error: adminErr } = await requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const body = await request.json();
    const { name, slug, industry, description, priceMonthly, priceYearly, skills, knowledgeBaseDocs, icon, color, isActive, sortOrder } = body;

    if (!name || !slug || !industry) {
      return errorResponse("name, slug, and industry are required", 400);
    }

    const pack = await prisma.kaiIndustryPack.create({
      data: {
        name,
        slug,
        industry,
        description: description ?? null,
        priceMonthly: priceMonthly ?? 0,
        priceYearly: priceYearly ?? null,
        skills: skills ?? [],
        knowledgeBaseDocs: knowledgeBaseDocs ?? [],
        icon: icon ?? null,
        color: color ?? null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return successResponse(pack, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
