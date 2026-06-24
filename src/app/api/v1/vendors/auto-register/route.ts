import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const db = createAdminClient();

    // Check if vendor already exists for this user
    const { data: profile } = await db.from("profiles").select("role, vendor_id").eq("id", user!.id).maybeSingle();
    if (profile?.vendor_id) {
      const { data: existingVendor } = await db.from("vendors").select("*").eq("id", profile.vendor_id).maybeSingle();
      if (existingVendor) return successResponse(existingVendor);
    }

    // Check via vendors.user_id
    const { data: existingByUser } = await db.from("vendors").select("*").eq("user_id", user!.id).maybeSingle();
    if (existingByUser) {
      await db.from("profiles").upsert({ id: user!.id, role: "vendor", vendor_id: existingByUser.id }, { onConflict: "id" });
      return successResponse(existingByUser);
    }

    // Create new vendor
    const name = (user!.email || user!.id).split("@")[0];
    const baseSlug = `shop-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${user!.id.slice(0, 6)}`;
    let slug = baseSlug;

    // Ensure unique slug
    const { data: slugCheck } = await db.from("vendors").select("id").eq("shop_slug", slug).maybeSingle();
    if (slugCheck) {
      slug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    const { data: vendor, error: vendorErr } = await db
      .from("vendors")
      .insert({
        user_id: user!.id,
        shop_name: `${name}'s Store`,
        shop_slug: slug,
        status: "active",
        vendor_tier: "bronze",
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (vendorErr) return errorResponse(vendorErr.message, 400);

    // Update profile
    await db.from("profiles").upsert({ id: user!.id, role: "vendor", vendor_id: vendor.id }, { onConflict: "id" });

    // Create vendor store
    const { data: existingStore } = await db.from("vendor_stores").select("id").eq("vendor_id", vendor.id).maybeSingle();
    if (!existingStore) {
      await db.from("vendor_stores").insert({
        vendor_id: vendor.id,
        store_name: `${name}'s Store`,
        store_slug: `store-${slug}`,
        default_url: `https://kauvex.com/vendors/${slug}`,
        status: "active",
      });
    }

    return successResponse(vendor, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
