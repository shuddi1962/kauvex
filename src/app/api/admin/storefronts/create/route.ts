import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse } from "@/lib/api-helpers";

const ADMIN_ROLES = ["super-admin", "admin", "finance-admin", "support-admin", "store-manager"];

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse("Missing or invalid Authorization header", 401);
    }

    const token = authHeader.slice(7);
    const adminSb = createAdminClient();
    const { data: { user }, error: authError } = await adminSb.auth.getUser(token);

    if (authError || !user) {
      return errorResponse("Invalid or expired token", 401);
    }

    const { data: profile } = await adminSb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return errorResponse("Admin access required", 403);
    }

    const body = await request.json();

    const { data, error } = await adminSb
      .from("storefronts")
      .insert([body.payload])
      .select();

    if (error) {
      return errorResponse(error.message, 400);
    }

    const storefrontId = data?.[0]?.id;

    if (storefrontId && body.categories?.length > 0) {
      const { error: catError } = await adminSb
        .from("storefront_categories")
        .insert(body.categories.map((c: string) => ({ storefront_id: storefrontId, category_id: c })))
        .maybeSingle();

      if (catError && !catError.message.includes("does not exist")) {
        console.warn("storefront_categories insert skipped:", catError.message);
      }
    }

    if (storefrontId && body.vendors?.length > 0) {
      const { error: venError } = await adminSb
        .from("storefront_vendors")
        .insert(body.vendors.map((v: string) => ({ storefront_id: storefrontId, vendor_id: v })))
        .maybeSingle();

      if (venError && !venError.message.includes("does not exist")) {
        console.warn("storefront_vendors insert skipped:", venError.message);
      }
    }

    return successResponse(data, 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Internal error", 500);
  }
}
