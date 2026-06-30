import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin, validateBody } from "@/lib/api-helpers";
import { listHubs, createHub } from "@/lib/manufacturers/hubs";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createHubSchema = z.object({
  countryCode: z.string().min(2).max(10),
  city: z.string().min(1).max(100),
  hubName: z.string().min(2).max(200),
  primaryCategories: z.array(z.string()).min(1),
  description: z.string().max(1000).optional(),
}).strict();

export async function GET(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("country") || undefined;
    const hubs = await listHubs(countryCode);
    return successResponse(hubs);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createHubSchema);
  if (valErr) return valErr;

  try {
    const hub = await createHub({
      countryCode: body!.countryCode,
      city: body!.city,
      hubName: body!.hubName,
      primaryCategories: body!.primaryCategories,
      description: body!.description ?? null,
    });
    return successResponse(hub, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
