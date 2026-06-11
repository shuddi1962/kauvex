import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  type: z.enum(["simple", "variable", "digital", "service", "bundle"]).optional(),
  sku: z.string().optional(),
  short_description: z.string().optional(),
  long_description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  regular_price: z.number().positive().optional(),
  sale_price: z.number().optional(),
  cost_price: z.number().optional(),
  images: z.array(z.string()).optional(),
  variants: z.array(z.record(z.string(), z.unknown())).optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  seo: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = createAdminClient();
    const { id } = params;

    const { data: product, error } = await db
      .from("products")
      .select("*, category:category_id(*), brand:brand_id(*), vendor:vendors!vendor_id(id, shop_name, shop_slug, rating, vendor_tier)")
      .eq("id", id)
      .single();

    if (error || !product) return errorResponse("Product not found", 404);

    const { data: inventory } = await db
      .from("product_inventory")
      .select("location_name, quantity, low_stock_threshold")
      .eq("product_id", id);

    const { data: reviews } = await db
      .from("reviews")
      .select("id, rating, title, body, user_id, created_at")
      .eq("product_id", id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(10);

    return successResponse({ ...product, inventory: inventory || [], recent_reviews: reviews || [] });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const isAdmin = profile?.role && ["super-admin", "store-manager"].includes(profile.role);

  try {
    const db = createAdminClient();
    const { id } = params;

    const { data: existing } = await db.from("products").select("vendor_id").eq("id", id).single();
    if (!existing) return errorResponse("Product not found", 404);

    if (!isAdmin && existing.vendor_id !== profile!.vendor_id) {
      return errorResponse("You do not own this product", 403);
    }

    const { data: body, error: valErr } = await validateBody(request, updateProductSchema);
    if (valErr) return valErr;

    const updates: Record<string, unknown> = { ...body!, updated_at: new Date().toISOString() };
    if (body!.images) updates.images = JSON.stringify(body!.images);
    if (body!.variants) updates.variants = JSON.stringify(body!.variants);
    if (body!.specifications) updates.specifications = JSON.stringify(body!.specifications);
    if (body!.seo) updates.seo = JSON.stringify(body!.seo);

    const { data: product, error } = await db
      .from("products")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return errorResponse(error.message, 400);

    return successResponse(product);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, profile, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  const isAdmin = profile?.role && ["super-admin", "store-manager"].includes(profile.role);

  try {
    const db = createAdminClient();
    const { id } = params;

    const { data: existing } = await db.from("products").select("vendor_id, status").eq("id", id).single();
    if (!existing) return errorResponse("Product not found", 404);

    if (!isAdmin && existing.vendor_id !== profile!.vendor_id) {
      return errorResponse("You do not own this product", 403);
    }

    const { error } = await db
      .from("products")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return errorResponse(error.message, 400);

    return successResponse({ message: "Product archived" });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
