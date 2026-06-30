import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin, validateBody } from "@/lib/api-helpers";
import { getHubById } from "@/lib/manufacturers/hubs";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateHubSchema = z.object({
  hubName: z.string().min(2).max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  countryCode: z.string().min(2).max(10).optional(),
  primaryCategories: z.array(z.string()).min(1).optional(),
  description: z.string().max(1000).optional(),
}).strict();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, updateHubSchema);
  if (valErr) return valErr;

  try {
    const { id } = await params;
    const existing = await getHubById(id);
    if (!existing) return errorResponse("Hub not found", 404);

    const updateData: any = {};
    if (body!.hubName !== undefined) updateData.hub_name = body!.hubName;
    if (body!.city !== undefined) updateData.city = body!.city;
    if (body!.countryCode !== undefined) updateData.country_code = body!.countryCode;
    if (body!.primaryCategories !== undefined) updateData.primary_categories = body!.primaryCategories;
    if (body!.description !== undefined) updateData.description = body!.description;

    const hub = await prisma.mfgHub.update({
      where: { id },
      data: updateData,
    });

    return successResponse({
      id: hub.id,
      countryCode: hub.country_code,
      city: hub.city,
      hubName: hub.hub_name,
      primaryCategories: hub.primary_categories,
      description: hub.description,
    });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const existing = await getHubById(id);
    if (!existing) return errorResponse("Hub not found", 404);

    await prisma.mfgHub.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
