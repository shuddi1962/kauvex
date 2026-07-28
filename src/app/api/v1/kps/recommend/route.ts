import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { aiRecommendService, aiCrossSell } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const recommendSchema = z.object({
  title: z.string().min(1).max(500),
  category: z.string().min(1).max(200),
  weight: z.number().optional(),
  voltage: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, recommendSchema);
  if (valErr) return valErr;

  try {
    const services = aiRecommendService(body!);
    const crossSell = aiCrossSell(body!.category.toLowerCase());

    return successResponse({
      product: { title: body!.title, category: body!.category },
      recommendedServices: services,
      crossSellProducts: crossSell,
    });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
