import { NextRequest } from "next/server";
import { successResponse, errorResponse, validateBody } from "@/lib/api-helpers";
import { autoRouteShipment } from "@/lib/shipping-automation";
import { z } from "zod";

const autoRouteSchema = z.object({
  destination_country: z.string().min(1).max(10),
  destination_city: z.string().min(1).max(200),
  destination_address: z.string().min(1).max(500),
  destination_postal_code: z.string().optional().default(""),
  weight: z.number().positive(),
  value: z.number().optional(),
  product_ids: z.array(z.object({
    product_id: z.string(),
    variant_id: z.string().optional(),
    quantity: z.number().int().positive(),
  })).min(1),
});

export async function POST(request: NextRequest) {
  const { data: body, error: valErr } = await validateBody(request, autoRouteSchema);
  if (valErr) return valErr;

  try {
    const result = await autoRouteShipment({
      destinationCountry: body!.destination_country,
      destinationCity: body!.destination_city,
      destinationAddress: body!.destination_address,
      destinationPostalCode: body!.destination_postal_code || "",
      productIds: body!.product_ids.map((p: any) => ({
        productId: p.product_id,
        variantId: p.variant_id,
        quantity: p.quantity,
      })),
      weight: body!.weight,
      value: body!.value,
    });

    if (result.error) return errorResponse(result.error, 400);

    return successResponse({
      warehouse: result.warehouse,
      rates: result.rates,
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
