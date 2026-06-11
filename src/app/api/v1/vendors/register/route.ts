import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const registerVendorSchema = z.object({
  shop_name: z.string().min(2).max(100),
  shop_slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  shop_description: z.string().max(2000).optional(),
  shop_logo: z.string().url().optional(),
  shop_banner: z.string().url().optional(),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, registerVendorSchema);
  if (valErr) return valErr;

  try {
    const db = createAdminClient();

    const { data: profile } = await db.from("profiles").select("role, vendor_id").eq("id", user!.id).single();

    if (profile?.vendor_id) {
      return errorResponse("You are already registered as a vendor", 409);
    }

    const { data: existingSlug } = await db.from("vendors").select("id").eq("shop_slug", body!.shop_slug).single();
    if (existingSlug) return errorResponse("Shop slug is already taken", 409);

    const { data: vendor, error: vendorErr } = await db
      .from("vendors")
      .insert({
        user_id: user!.id,
        shop_name: body!.shop_name,
        shop_slug: body!.shop_slug,
        shop_description: body!.shop_description || null,
        shop_logo: body!.shop_logo || null,
        shop_banner: body!.shop_banner || null,
        status: "pending",
        vendor_tier: "bronze",
      })
      .select("*")
      .single();

    if (vendorErr) return errorResponse(vendorErr.message, 400);

    await db.from("profiles").update({ role: "vendor", vendor_id: vendor!.id }).eq("id", user!.id);

    const slug = body!.shop_slug;
    const storeSlug = `store-${slug}`;

    const { data: existingStore } = await db.from("vendor_stores").select("id").eq("vendor_id", vendor!.id).single();
    if (!existingStore) {
      await db.from("vendor_stores").insert({
        vendor_id: vendor!.id,
        store_name: body!.shop_name,
        store_slug: storeSlug,
        default_url: `https://kauvex.com/vendors/${slug}`,
        description: body!.shop_description || null,
        logo: body!.shop_logo || null,
        banner: body!.shop_banner || null,
        status: "active",
      });
    }

    return successResponse(vendor, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
