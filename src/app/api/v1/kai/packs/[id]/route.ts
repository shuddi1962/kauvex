import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pack = await prisma.kaiIndustryPack.findUnique({
      where: { id },
    });

    if (!pack) {
      return errorResponse("Industry pack not found", 404);
    }

    return successResponse(pack);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: adminErr } = await requireAdmin(request);
  if (adminErr) return adminErr;

  try {
    const { id } = await params;

    const existing = await prisma.kaiIndustryPack.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Industry pack not found", 404);
    }

    const body = await request.json();
    const { name, slug, industry, description, priceMonthly, priceYearly, skills, knowledgeBaseDocs, icon, color, isActive, sortOrder } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (industry !== undefined) updateData.industry = industry;
    if (description !== undefined) updateData.description = description;
    if (priceMonthly !== undefined) updateData.priceMonthly = priceMonthly;
    if (priceYearly !== undefined) updateData.priceYearly = priceYearly;
    if (skills !== undefined) updateData.skills = skills;
    if (knowledgeBaseDocs !== undefined) updateData.knowledgeBaseDocs = knowledgeBaseDocs;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const pack = await prisma.kaiIndustryPack.update({
      where: { id },
      data: updateData,
    });

    return successResponse(pack);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: adminErr } = await requireAdmin(_request);
  if (adminErr) return adminErr;

  try {
    const { id } = await params;

    const existing = await prisma.kaiIndustryPack.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Industry pack not found", 404);
    }

    await prisma.kaiIndustryPack.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
