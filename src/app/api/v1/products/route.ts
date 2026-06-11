import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, paginatedResponse, getAuthUser, requireVendor, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const VALID_SORTS = ["created_at", "price_asc", "price_desc", "name_asc", "name_desc", "rating", "popular"] as const;

const createProductSchema = z.object({
  name: z.string().min(1).max(500),
  type: z.enum(["simple", "variable", "digital", "service", "bundle"]).default("simple"),
  sku: z.string().optional(),
  short_description: z.string().optional(),
  long_description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  regular_price: z.number().positive(),
  sale_price: z.number().optional(),
  cost_price: z.number().optional(),
  images: z.array(z.string()).default([]),
  variants: z.array(z.record(z.string(), z.unknown())).default([]),
  specifications: z.record(z.string(), z.unknown()).default({}),
  tags: z.array(z.string()).default([]),
  vendor_id: z.string().uuid().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  seo: z.record(z.string(), z.unknown()).default({}),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const db = createAdminClient();

    const category = searchParams.get("category") || "";
    const q = searchParams.get("q") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const vendorId = searchParams.get("vendorId") || "";
    const storefrontId = searchParams.get("storefrontId") || "";
    const featured = searchParams.get("featured");
    const sortRaw = searchParams.get("sort") || "created_at";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    const sort = VALID_SORTS.includes(sortRaw as typeof VALID_SORTS[number])
      ? (sortRaw as typeof VALID_SORTS[number])
      : "created_at";

    let query = db
      .from("products")
      .select("*, category:category_id(id, name, slug), brand:brand_id(id, name, slug)", { count: "exact" })
      .eq("status", "published");

    if (q) {
      const safe = q.replace(/[%_\\]/g, "\\$&");
      query = query.or(`name.ilike.%${safe}%,short_description.ilike.%${safe}%,sku.ilike.%${safe}%`);
    }
    if (category) query = query.eq("category_id", category);
    if (minPrice) query = query.gte("regular_price", parseFloat(minPrice));
    if (maxPrice) query = query.lte("regular_price", parseFloat(maxPrice));
    if (vendorId) query = query.eq("vendor_id", vendorId);
    if (featured === "true") query = query.eq("featured", true);

    switch (sort) {
      case "price_asc": query = query.order("regular_price", { ascending: true }); break;
      case "price_desc": query = query.order("regular_price", { ascending: false }); break;
      case "name_asc": query = query.order("name", { ascending: true }); break;
      case "name_desc": query = query.order("name", { ascending: false }); break;
      case "rating": query = query.order("rating", { ascending: false, nullsFirst: false }); break;
      case "popular": query = query.order("review_count", { ascending: false, nullsFirst: false }); break;
      default: query = query.order("created_at", { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) return errorResponse("Failed to fetch products", 500);

    return paginatedResponse(products || [], count || 0, page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const isAdmin = profile?.role && ["super-admin", "store-manager"].includes(profile.role);
  const isVendor = profile?.role === "vendor";

  if (!isAdmin && !isVendor) return errorResponse("Vendor or admin access required", 403);

  const { data: body, error: valErr } = await validateBody(request, createProductSchema);
  if (valErr) return valErr;

  try {
    const db = createAdminClient();
    const slug = body!.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();

    const { data: product, error } = await db
      .from("products")
      .insert({
        ...body!,
        slug,
        vendor_id: isVendor ? profile!.vendor_id : body!.vendor_id || undefined,
        images: JSON.stringify(body!.images),
        variants: JSON.stringify(body!.variants),
        specifications: JSON.stringify(body!.specifications),
        seo: JSON.stringify(body!.seo),
      })
      .select("*")
      .single();

    if (error) return errorResponse(error.message, 400);

    return successResponse(product, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
