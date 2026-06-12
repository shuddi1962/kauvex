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
