import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  const { error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const templates = await prisma.kv_digital_passport_templates.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return successResponse(templates);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { entityType, name, icon, color, schemaFields } = body;

    if (!entityType || !name) {
      return errorResponse("entityType and name are required", 400);
    }

    const existing = await prisma.kv_digital_passport_templates.findUnique({
      where: { entityType },
    });
    if (existing) return errorResponse("Template with this entityType already exists", 409);

    const template = await prisma.kv_digital_passport_templates.create({
      data: {
        entityType,
        name,
        icon: icon || null,
        color: color || null,
        schemaFields: schemaFields || [],
        isActive: true,
      },
    });

    return successResponse(template, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
