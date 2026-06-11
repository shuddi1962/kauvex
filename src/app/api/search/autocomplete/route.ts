import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function sanitizeSearchTerm(term: string): string {
  return term.replace(/[%_\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim();

  if (!query || query.length < 2) {
    return NextResponse.json({
      products: [],
      categories: [],
      brands: [],
      popularSearches: [],
    });
  }

  try {
    const db = createAdminClient();
    const safe = sanitizeSearchTerm(query);
    const pattern = `%${safe}%`;

    // Fire all queries in parallel for speed
    const [productsRes, categoriesRes, brandsRes, popularRes] =
      await Promise.all([
        // 5 matching products
        db
          .from("products")
          .select("id, name, slug, sku, regular_price, sale_price, images, category_id, brand_id, rating, review_count")
          .eq("status", "published")
          .or(
            `name.ilike.${pattern},short_description.ilike.${pattern},sku.ilike.${pattern}`
          )
          .order("rating", { ascending: false, nullsFirst: false })
          .limit(5),

        // 3 matching categories
        db
          .from("categories")
          .select("id, name, slug, image, description")
          .or(`name.ilike.${pattern},description.ilike.${pattern}`)
          .limit(3),

        // 2 matching brands
        db
          .from("brands")
          .select("id, name, slug, logo")
          .or(`name.ilike.${pattern},description.ilike.${pattern}`)
          .limit(2),

        // 3 popular recent searches
        db
          .from("search_queries")
          .select("query")
          .ilike("query", pattern)
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

    if (productsRes.error || categoriesRes.error || brandsRes.error) {
      throw new Error("Autocomplete query failed");
    }

    // Deduplicate popular searches
    const seen = new Set<string>();
    const popularSearches: string[] = [];
    (popularRes.data || []).forEach((s: any) => {
      const q = s.query;
      if (q && !seen.has(q) && q.toLowerCase() !== query.toLowerCase()) {
        seen.add(q);
        popularSearches.push(q);
      }
    });

    return NextResponse.json({
      products: productsRes.data || [],
      categories: categoriesRes.data || [],
      brands: brandsRes.data || [],
      popularSearches,
    });
  } catch (error) {
    return NextResponse.json(
      {
        products: [],
        categories: [],
        brands: [],
        popularSearches: [],
        error: "Autocomplete failed",
      },
      { status: 500 }
    );
  }
}
