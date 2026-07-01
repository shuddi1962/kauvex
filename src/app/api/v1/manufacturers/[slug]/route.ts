import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { getManufacturerBySlug, updateManufacturer } from "@/lib/manufacturers/registration";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateManufacturerSchema = z.object({
  companyName: z.string().min(2).max(200).optional(),
  city: z.string().max(100).optional(),
  manufacturingHub: z.string().max(100).optional(),
  website: z.string().url().optional(),
}).strict();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const manufacturer = await getManufacturerBySlug(slug);
    if (!manufacturer) return errorResponse("Manufacturer not found", 404);
    return successResponse(manufacturer);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { slug } = await params;
  const manufacturer = await getManufacturerBySlug(slug);
  if (!manufacturer) return errorResponse("Manufacturer not found", 404);

  // Only the manufacturer owner can update
  if (manufacturer.userId !== user!.id) {
    return errorResponse("Unauthorized", 403);
  }

  const { data: body, error: valErr } = await validateBody(request, updateManufacturerSchema);
  if (valErr) return valErr;

  try {
    const updated = await updateManufacturer(manufacturer.id, {
      companyName: body!.companyName,
      city: body!.city,
      manufacturingHub: body!.manufacturingHub,
      website: body!.website,
    });

    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
