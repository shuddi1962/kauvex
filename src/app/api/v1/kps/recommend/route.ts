import { NextRequest } from "next/server";
import { successResponse, errorResponse, validateBody } from "@/lib/api-helpers";
import { aiRecommendService } from "@/lib/kpn";
import { z } from "zod";

export const dynamic = "force-dynamic";

const productSchema = z.object({
  title: z.string().min(1).max(500),
  category: z.string().optional().default(""),
  weight: z.number().optional(),
});

const recommendSchema = z.object({
  products: z.array(productSchema).min(1).max(50),
  location: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const { data: body, error: valErr } = await validateBody(request, recommendSchema);
  if (valErr) return valErr;

  try {
    const services: any[] = [];
    const seenTypes = new Set<string>();

    for (const product of body!.products) {
      const result = aiRecommendService({
        title: product.title,
        category: product.category || "General",
        weight: product.weight,
      });

      for (const svc of result) {
        const key = `${svc.serviceType}-${svc.productCategory}`;
        if (!seenTypes.has(key)) {
          seenTypes.add(key);
          services.push({
            ...svc,
            productCategory: svc.productCategory || product.category || "General",
          });
        }
      }
    }

    return successResponse({ services, location: body?.location });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}