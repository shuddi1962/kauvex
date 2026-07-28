import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const createReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional().default(""),
  body: z.string().max(5000).optional().default(""),
  images: z.array(z.string()).max(10).default([]),
});

export async function POST(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createReviewSchema);
  if (valErr) return valErr;

  try {
    const db = createAdminClient();

    const { data: existing } = await db
      .from("reviews")
      .select("id")
      .eq("product_id", body!.productId)
      .eq("user_id", user!.id)
      .maybeSingle();

    if (existing) {
      return errorResponse("You have already reviewed this product", 409);
    }

    let isVerified = false;
    const { data: orders } = await db
      .from("orders")
      .select("id")
      .eq("customer_id", user!.id)
      .in("status", ["delivered", "completed"]);

    if (orders && orders.length > 0) {
      const orderIds = orders.map((o: any) => o.id);
      const { data: items } = await db
        .from("order_items")
        .select("id")
        .eq("product_id", body!.productId)
        .in("order_id", orderIds)
        .limit(1);

      if (items && items.length > 0) {
        isVerified = true;
      }
    }

    const { data: review, error } = await db
      .from("reviews")
      .insert({
        product_id: body!.productId,
        user_id: user!.id,
        rating: body!.rating,
        title: body!.title || null,
        body: body!.body || null,
        images: body!.images,
        is_verified: isVerified,
        helpful_count: 0,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) return errorResponse(error.message, 400);

    return successResponse(review, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
