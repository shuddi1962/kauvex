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

    const skill = await prisma.kaiSkill.findUnique({
      where: { id },
    });

    if (!skill) {
      return errorResponse("Skill not found", 404);
    }

    return successResponse(skill);
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

    const existing = await prisma.kaiSkill.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Skill not found", 404);
    }

    const body = await request.json();
    const { name, slug, description, category, industry, priceMonthly, systemPrompt, icon, color, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (industry !== undefined) updateData.industry = industry;
    if (priceMonthly !== undefined) updateData.priceMonthly = priceMonthly;
    if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;

    const skill = await prisma.kaiSkill.update({
      where: { id },
      data: updateData,
    });

    return successResponse(skill);
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

    const existing = await prisma.kaiSkill.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Skill not found", 404);
    }

    await prisma.kaiSkill.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
