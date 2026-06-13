import { NextRequest } from "next/server";
import { successResponse, errorResponse, validateBody } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const rateRequestSchema = z.object({
  from_warehouse_id: z.string().uuid().optional(),
  to_country: z.string().min(2).max(2),
  to_city: z.string().optional(),
  weight: z.number().positive(),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
      unit: z.enum(["cm", "in"]).default("cm"),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  const { data: body, error: valErr } = await validateBody(request, rateRequestSchema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();

    const { data: rates, error } = await adminDb
      .from("shipping_rates")
      .select("*, carrier:shipping_carriers(name, code, type)")
      .eq("is_active", true)
      .filter("countries", "cs", `{${body!.to_country}}`)
      .lte("min_weight", body!.weight)
      .gte("max_weight", body!.weight)
      .order("price", { ascending: true });

    if (error) return errorResponse("Failed to fetch rates: " + error.message, 400);

    const options = (rates || []).map((rate: any) => ({
      rate_id: rate.id,
      carrier_name: rate.carrier?.name || "Unknown",
      carrier_code: rate.carrier?.code || "",
      service: rate.name,
      price: Number(rate.price),
      currency: "USD",
      estimated_days: rate.estimated_days,
      is_free: rate.is_free,
    }));

    return successResponse(options);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
