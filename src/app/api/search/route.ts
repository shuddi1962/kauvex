import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type SortOption = "relevance" | "price_asc" | "price_desc" | "rating" | "newest";

const VALID_SORTS: SortOption[] = [
  "relevance",
  "price_asc",
  "price_desc",
  "rating",
  "newest",
];

const PRICE_RANGES = [
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 - $50", min: 25, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $500", min: 100, max: 500 },
  { label: "Over $500", min: 500, max: Infinity },
] as const;

function sanitizeSearchTerm(term: string): string {
  return term.replace(/[%_\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = (searchParams.get("q") || "").trim();
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const rating = searchParams.get("rating");
  const vendor = searchParams.get("vendor") || "";
  const storefrontId = searchParams.get("storefrontId") || "";
  const sortRaw = searchParams.get("sort") || "relevance";
  const sort: SortOption = VALID_SORTS.includes(sortRaw as SortOption)
    ? (sortRaw as SortOption)
    : "relevance";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20"))
  );
  const offset = (page - 1) * limit;

  try {
    const db = createAdminClient();

    // ---- Main data query ----
    let dataQuery = db
      .from("products")
      .select("*, category:category_id(*), brand:brand_id(*)", {
        count: "exact",
      })
      .eq("status", "published");

    if (q) {
      const safe = sanitizeSearchTerm(q);
      dataQuery = dataQuery.or(
        `name.ilike.%${safe}%,short_description.ilike.%${safe}%,sku.ilike.%${safe}%`
      );
    }
    if (category) dataQuery = dataQuery.eq("category_id", category);
    if (minPrice)
      dataQuery = dataQuery.gte("regular_price", parseFloat(minPrice));
    if (maxPrice)
      dataQuery = dataQuery.lte("regular_price", parseFloat(maxPrice));
    if (rating) dataQuery = dataQuery.gte("rating", parseFloat(rating));
    if (vendor) dataQuery = dataQuery.eq("vendor_id", vendor);

    switch (sort) {
      case "price_asc":
        dataQuery = dataQuery.order("regular_price", { ascending: true });
        break;
      case "price_desc":
        dataQuery = dataQuery.order("regular_price", { ascending: false });
        break;
      case "rating":
        dataQuery = dataQuery.order("rating", {
          ascending: false,
          nullsFirst: false,
        });
        break;
      case "newest":
        dataQuery = dataQuery.order("created_at", { ascending: false });
        break;
    }

    dataQuery = dataQuery.range(offset, offset + limit - 1);

    const { data: products, error, count } = await dataQuery;
    if (error) throw error;

    // ---- Facet query (unpaginated, lightweight) ----
    let facetQuery = db
      .from("products")
      .select("category_id, regular_price, sale_price, rating")
      .eq("status", "published");

    if (q) {
      const safe = sanitizeSearchTerm(q);
      facetQuery = facetQuery.or(
        `name.ilike.%${safe}%,short_description.ilike.%${safe}%,sku.ilike.%${safe}%`
      );
    }
    if (category) facetQuery = facetQuery.eq("category_id", category);
    if (minPrice)
      facetQuery = facetQuery.gte("regular_price", parseFloat(minPrice));
    if (maxPrice)
      facetQuery = facetQuery.lte("regular_price", parseFloat(maxPrice));
    if (rating) facetQuery = facetQuery.gte("rating", parseFloat(rating));
    if (vendor) facetQuery = facetQuery.eq("vendor_id", vendor);

    const { data: facetRaw } = await facetQuery;

    // -- Compute category facets --
    const catCounts: Record<string, number> = {};
    const ratingCounts: Record<number, number> = {};

    (facetRaw || []).forEach((p: any) => {
      if (p.category_id) {
        catCounts[p.category_id] = (catCounts[p.category_id] || 0) + 1;
      }
      const r = Math.floor(p.rating || 0);
      ratingCounts[r] = (ratingCounts[r] || 0) + 1;
    });

    const catIds = Object.keys(catCounts);
    let categories: { id: string; name: string; slug: string }[] = [];
    if (catIds.length > 0) {
      const { data: cats } = await db
        .from("categories")
        .select("id, name, slug")
        .in("id", catIds);
      categories = (cats || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: catCounts[c.id] || 0,
      }));
    }

    const categoryFacets = categories.sort(
      (a: any, b: any) => b.count - a.count
    );

    // -- Compute price range facets --
    const priceRangeFacets = PRICE_RANGES.map((range) => ({
      ...range,
      count: (facetRaw || []).filter((p: any) => {
        const price = p.sale_price || p.regular_price;
        return price >= range.min && price < range.max;
      }).length,
    }));

    // -- Compute rating facets --
    const ratingFacets = [5, 4, 3, 2, 1].map((v) => ({
      value: v,
      count: ratingCounts[v] || 0,
    }));

    // ---- Log search query ----
    await db.from("search_queries").insert({
      query: q || "(browse)",
      storefront_id: storefrontId || null,
      results_count: count || 0,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      products: products || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      facets: {
        categories: categoryFacets,
        priceRanges: priceRangeFacets,
        ratings: ratingFacets,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
