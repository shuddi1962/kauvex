import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { getDigitalTwin, updateDigitalTwin } from "@/lib/kpn";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateTwinSchema = z.object({
  assetName: z.string().min(1).max(200).optional(),
  assetType: z.string().max(100).optional(),
  manufacturer: z.string().max(200).optional(),
  model: z.string().max(200).optional(),
  serialNumber: z.string().max(100).optional(),
  purchasePrice: z.number().min(0).optional(),
  documents: z.array(z.any()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const twin = await getDigitalTwin(id);
    if (!twin) return errorResponse("Digital twin not found", 404);
    return successResponse(twin);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, updateTwinSchema);
  if (valErr) return valErr;

  try {
    const { id } = await params;
    const twin = await getDigitalTwin(id);
    if (!twin) return errorResponse("Digital twin not found", 404);
    if (twin.ownerId !== user!.id) return errorResponse("Unauthorized", 403);

    const updated = await updateDigitalTwin(id, body!);
    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const twin = await getDigitalTwin(id);
    if (!twin) return errorResponse("Digital twin not found", 404);
    if (twin.ownerId !== user!.id) return errorResponse("Unauthorized", 403);

    await prisma.kpnDigitalTwin.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
