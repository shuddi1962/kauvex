import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const industry = searchParams.get("industry");
    const all = searchParams.get("all") === "true";

    if (all) {
      const { error: adminErr } = await requireAdmin(request);
      if (adminErr) return adminErr;

      const where: Record<string, unknown> = {};
      if (category) where.category = category;
      if (industry) where.industry = industry;

      const skills = await prisma.kaiSkill.findMany({
        where,
        orderBy: { installCount: "desc" },
      });
      return successResponse(skills);
    }

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    if (industry) where.industry = industry;

    const skills = await prisma.kaiSkill.findMany({
      where,
      orderBy: { installCount: "desc" },
    });
    return successResponse(skills);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { error: adminErr } = await requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const body = await request.json();
    const { name, slug, description, category, industry, priceMonthly, systemPrompt, icon, color } = body;

    if (!name || !slug) {
      return errorResponse("name and slug are required", 400);
    }

    const skill = await prisma.kaiSkill.create({
      data: {
        name,
        slug,
        description: description ?? null,
        category: category ?? null,
        industry: industry ?? null,
        priceMonthly: priceMonthly ?? 0,
        systemPrompt: systemPrompt ?? null,
        icon: icon ?? null,
        color: color ?? null,
      },
    });

    return successResponse(skill, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
