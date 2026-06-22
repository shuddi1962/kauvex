import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { insforge } from "@/lib/insforge";
import { determineBuyBoxWinner } from "@/lib/buybox";
import { demoToUuid } from "@/lib/utils";
import { z } from "zod";

const createOfferSchema = z.object({
  shared_product_id: z.string(),
  price: z.number().positive(),
  currency: z.string().default("USD"),
  inventory: z.number().int().min(0),
  fulfillment_type: z.enum(["merchant", "FBK"]).default("merchant"),
  condition: z.enum(["new", "like_new", "used_good", "refurbished"]).default("new"),
  shipping_days: z.number().int().min(1).max(60).default(5),
  warranty: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: rawBody, error: valErr } = await validateBody(request, createOfferSchema);
  if (valErr) return valErr;

  // Convert demo product IDs to deterministic UUIDs for DB compatibility
  const isDemoProduct = rawBody!.shared_product_id.startsWith("demo-");
  const body = { ...rawBody!, shared_product_id: isDemoProduct ? demoToUuid(rawBody!.shared_product_id) : rawBody!.shared_product_id };

  try {
    const sb = insforge.database;
    let { data: profile } = await sb.from("profiles").select("vendor_id, role").eq("id", user!.id).single();

    // Auto-create vendor profile on first sell
    if (!profile || profile.role !== "vendor" || !profile.vendor_id) {
      const adminDb = createAdminClient();
      const shopSlug = `vendor-${user!.id!.slice(0, 8)}-${Date.now().toString(36)}`;
      const { data: newVendor, error: vendorErr } = await adminDb.from("vendors").insert({
        user_id: user!.id,
        shop_name: "My Kauvex Store",
        shop_slug: shopSlug,
        status: "approved",
        vendor_tier: "bronze",
        commission: "10",
      }).select("*").single();

      if (vendorErr || !newVendor) return errorResponse("Could not create vendor profile: " + (vendorErr?.message || "unknown error"), 500);

      const { error: upsertErr } = await adminDb.from("profiles").upsert({
        id: user!.id,
        vendor_id: newVendor.id,
        role: "vendor",
      }, { onConflict: "id" });
      if (upsertErr) return errorResponse("Failed to update profile: " + upsertErr.message, 500);

      profile = { vendor_id: newVendor.id, role: "vendor" };
    }

    // Skip DB product lookup for demo products — they don't exist in shared_catalog_products
    if (!isDemoProduct) {
      const { data: product } = await sb.from("shared_catalog_products").select("id").eq("id", body!.shared_product_id).single();
      if (!product) return errorResponse("Product not found in catalog", 404);
    }

    const { data: existing } = await sb
      .from("vendor_offers")
      .select("id")
      .eq("shared_product_id", body!.shared_product_id)
      .eq("vendor_id", profile.vendor_id)
      .eq("is_active", true)
      .maybeSingle();
    if (existing) return errorResponse("You already have an active offer for this product", 409);

    const adminDb = createAdminClient();
    const { data: offer, error: offerErr } = await adminDb
      .from("vendor_offers")
      .insert({
        shared_product_id: body!.shared_product_id,
        vendor_id: profile.vendor_id,
        price: body!.price,
        currency: body!.currency,
        inventory: body!.inventory,
        fulfillment_type: body!.fulfillment_type,
        condition: body!.condition,
        shipping_days: body!.shipping_days,
        is_active: true,
      })
      .select("*")
      .single();

    if (offerErr) return errorResponse("Failed to create offer: " + offerErr.message, 400);

    const { winner } = await determineBuyBoxWinner(body!.shared_product_id);

    return successResponse({ offer, buy_box_winner: winner }, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const sb = insforge.database;
    const { data: profile } = await sb.from("profiles").select("vendor_id").eq("id", user!.id).single();
    if (!profile?.vendor_id) return errorResponse("You need a vendor profile to list offers. Please complete your vendor registration first.", 403);

    const { data: offers, error } = await sb
      .from("vendor_offers")
      .select("*, shared_catalog_products(title, brand, images)")
      .eq("vendor_id", profile.vendor_id)
      .order("created_at", { ascending: false });

    if (error) return errorResponse(error.message, 400);

    return successResponse(offers || []);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
