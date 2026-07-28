import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { getIndustryHubs, createIndustryHub } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createHubSchema = z.object({
  hubName: z.string().min(1).max(200),
  hubSlug: z.string().min(1).max(100),
  subdomain: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  productCategories: z.array(z.string()).optional(),
  professionalCategories: z.array(z.string()).optional(),
  configuratorsAvailable: z.array(z.string()).optional(),
  pillarsAvailable: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  try {
    const hubs = await getIndustryHubs();
    return successResponse(hubs);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createHubSchema);
  if (valErr) return valErr;

  try {
    const hub = await createIndustryHub(body!);
    return successResponse(hub, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
