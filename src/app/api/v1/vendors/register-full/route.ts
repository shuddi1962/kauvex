import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const registerVendorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  business_name: z.string().min(1).max(200),
  legal_business_name: z.string().min(1).max(200),
  store_name: z.string().min(1).max(100),
  store_slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  business_type: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  business_address: z.string().optional(),
  tax_id: z.string().optional(),
  government_id: z.string().optional(),
  cac_number: z.string().optional(),
  vat_number: z.string().optional(),
  selected_storefronts: z.array(z.string()).optional(),
  id_type: z.string().optional(),
  id_number: z.string().optional(),
  shop_description: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  const { data: body, error: valErr } = await validateBody(request, registerVendorSchema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();

    const { data: existingUser } = await adminDb.auth.admin.listUsers();
    const emailTaken = existingUser?.users?.some((u: any) => u.email === body!.email);
    if (emailTaken) {
      return errorResponse("An account with this email already exists", 409);
    }

    const { data: existingSlug } = await adminDb.from("vendors").select("id").eq("shop_slug", body!.store_slug).maybeSingle();
    if (existingSlug) {
      return errorResponse("This store URL is already taken", 409);
    }

    const { data: authUser, error: createErr } = await adminDb.auth.admin.createUser({
      email: body!.email,
      password: body!.password,
      email_confirm: true,
      user_metadata: { role: "vendor", name: body!.business_name },
    });

    if (createErr || !authUser?.user) {
      return errorResponse(createErr?.message || "Failed to create user", 400);
    }

    const userId = authUser.user.id;

    const profilePayload: Record<string, any> = {
      id: userId,
      email: body!.email,
      full_name: body!.business_name,
      phone: body!.phone || null,
      role: "vendor",
    };

    const { error: profileErr } = await adminDb.from("profiles").insert([profilePayload]);
    if (profileErr) {
      await adminDb.auth.admin.deleteUser(userId);
      return errorResponse("Failed to create profile: " + profileErr.message, 400);
    }

    const { data: vendor, error: vendorErr } = await adminDb
      .from("vendors")
      .insert({
        user_id: userId,
        shop_name: body!.store_name,
        shop_slug: body!.store_slug,
        shop_description: body!.shop_description || null,
        status: "pending",
        vendor_tier: "bronze",
      })
      .select("*")
      .single();

    if (vendorErr) {
      await adminDb.auth.admin.deleteUser(userId);
      await adminDb.from("profiles").delete().eq("id", userId);
      return errorResponse("Failed to create vendor: " + vendorErr.message, 400);
    }

    await adminDb.from("profiles").update({ vendor_id: vendor!.id }).eq("id", userId);

    const storefronts = body!.selected_storefronts || ["global"];
    const storeSlug = `store-${body!.store_slug}`;

    const storeInserts = storefronts.map((sf: string) => ({
      vendor_id: vendor!.id,
      store_name: body!.store_name,
      store_slug: storeSlug,
      default_url: `https://kauvex.com/vendors/${body!.store_slug}`,
      description: body!.shop_description || null,
      status: "active",
      storefront_id: sf === "global" ? null : sf,
    }));

    const { error: storeErr } = await adminDb.from("vendor_stores").insert(storeInserts);
    if (storeErr) {
      console.error("Failed to create vendor stores:", storeErr);
    }

    // DEMO ONLY: Auto-enroll vendor in FBK + seed demo products
    // Remove before production launch — vendors should enroll manually via /vendor/fbk/enroll
    const isDemo = true;
    if (isDemo) {
      const firstStore = storeInserts[0];
      await adminDb.from("fbk_enrollments").insert({
        vendor_id: vendor!.id,
        vendor_store_id: firstStore?.storefront_id || null,
        status: "active",
        monthly_fee: 0,
        pick_pack_fee: 0,
        storage_fee: 0,
        returns_fee: 0,
        terms_accepted_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      }).maybeSingle();

      const demoProducts = [
        { name: "Wireless Bluetooth Headphones", sku: `DEMO-${body!.store_slug}-001`, price: 45000, stock_quantity: 50 },
        { name: "Premium Leather Wallet", sku: `DEMO-${body!.store_slug}-002`, price: 12500, stock_quantity: 100 },
        { name: "Portable Power Bank 20000mAh", sku: `DEMO-${body!.store_slug}-003`, price: 22000, stock_quantity: 75 },
        { name: "Organic Green Tea Set", sku: `DEMO-${body!.store_slug}-004`, price: 8500, stock_quantity: 200 },
        { name: "Stainless Steel Water Bottle", sku: `DEMO-${body!.store_slug}-005`, price: 15000, stock_quantity: 150 },
      ];
      for (const dp of demoProducts) {
        await adminDb.from("products").insert({
          vendor_id: vendor!.id,
          name: dp.name,
          sku: dp.sku,
          description: dp.name,
          regular_price: dp.price,
          sale_price: dp.price,
          stock_quantity: dp.stock_quantity,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    return successResponse({
      vendor_id: vendor!.id,
      shop_name: body!.store_name,
      shop_slug: body!.store_slug,
      status: "pending",
      message: "Vendor account created successfully. Please log in.",
    }, 201);

  } catch (err) {
    console.error("Vendor registration error:", err);
    return errorResponse("Internal server error", 500);
  }
}
