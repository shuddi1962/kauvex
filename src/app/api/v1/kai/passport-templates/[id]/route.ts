import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { id } = params;
    const body = await request.json();
    const { name, icon, color, schemaFields, isActive } = body;

    const existing = await prisma.kv_digital_passport_templates.findUnique({
      where: { id },
    });
    if (!existing) return errorResponse("Template not found", 404);

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (schemaFields !== undefined) updateData.schemaFields = schemaFields;
    if (isActive !== undefined) updateData.isActive = isActive;

    const template = await prisma.kv_digital_passport_templates.update({
      where: { id },
      data: updateData,
    });

    return successResponse(template);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error: authErr } = await requireAdmin(_request);
  if (authErr) return authErr;

  try {
    const { id } = params;

    const existing = await prisma.kv_digital_passport_templates.findUnique({
      where: { id },
    });
    if (!existing) return errorResponse("Template not found", 404);

    await prisma.kv_digital_passport_templates.delete({
      where: { id },
    });

    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
