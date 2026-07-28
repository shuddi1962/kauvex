import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { createDigitalTwin, getDigitalTwins } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createTwinSchema = z.object({
  assetName: z.string().min(1).max(200),
  assetType: z.string().min(1).max(100),
  orderId: z.string().optional(),
  manufacturer: z.string().max(200).optional(),
  model: z.string().max(200).optional(),
  serialNumber: z.string().max(100).optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  installationDate: z.string().optional(),
  installerId: z.string().optional(),
  warrantyStart: z.string().optional(),
  warrantyEnd: z.string().optional(),
  documents: z.array(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const twins = await getDigitalTwins(user!.id);
    return successResponse(twins);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createTwinSchema);
  if (valErr) return valErr;

  try {
    const twin = await createDigitalTwin({
      ...body!,
      ownerId: user!.id,
      purchaseDate: body!.purchaseDate ? new Date(body!.purchaseDate) : undefined,
      installationDate: body!.installationDate ? new Date(body!.installationDate) : undefined,
      warrantyStart: body!.warrantyStart ? new Date(body!.warrantyStart) : undefined,
      warrantyEnd: body!.warrantyEnd ? new Date(body!.warrantyEnd) : undefined,
    });
    return successResponse(twin, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
