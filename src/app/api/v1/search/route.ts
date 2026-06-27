import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const demoProducts = [
  {
    id: "p1",
    name: "Wireless Earbuds Pro",
    slug: "wireless-earbuds-pro",
    price: 15000,
    original_price: 25000,
    images: ["/products/earbuds.jpg"],
    category: { name: "Electronics" },
    vendor: { name: "TechHub", rating: 4.8 },
    rating: 4.7,
    reviews: 234,
    in_stock: true,
    is_sponsored: true,
  },
  {
    id: "p2",
    name: "USB-C Fast Charger",
    slug: "usb-c-fast-charger",
    price: 8500,
    original_price: 12000,
    images: ["/products/charger.jpg"],
    category: { name: "Electronics" },
    vendor: { name: "PowerZone", rating: 4.5 },
    rating: 4.3,
    reviews: 89,
    in_stock: true,
    is_sponsored: false,
  },
];

const demoFacets = {
  categories: [
    { name: "Electronics", count: 25 },
    { name: "Fashion", count: 12 },
    { name: "Home", count: 10 },
  ],
  price_ranges: [
    { min: 0, max: 10000, count: 15 },
    { min: 10000, max: 25000, count: 20 },
    { min: 25000, max: 50000, count: 12 },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const min_price = searchParams.get("min_price");
    const max_price = searchParams.get("max_price");
    const rating = searchParams.get("rating");
    const sort = searchParams.get("sort") || "relevance";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from("kv_products")
      .select("*, kv_categories(name), kv_vendors(name, rating)", { count: "exact" })
      .eq("status", "active");

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (category) {
      query = query.eq("kv_categories.name", category);
    }
    if (min_price) {
      query = query.gte("price", parseFloat(min_price));
    }
    if (max_price) {
      query = query.lte("price", parseFloat(max_price));
    }
    if (rating) {
      query = query.gte("rating", parseFloat(rating));
    }

    if (sort === "price_asc") query = query.order("price", { ascending: true });
    else if (sort === "price_desc") query = query.order("price", { ascending: false });
    else if (sort === "rating") query = query.order("rating", { ascending: false });
    else if (sort === "newest") query = query.order("created_at", { ascending: false });
    else query = query.order("is_sponsored", { ascending: false }).order("rating", { ascending: false });

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      products: data,
      total: count || 0,
      page,
      limit,
      facets: demoFacets,
    });
  } catch {
    return NextResponse.json({
      products: demoProducts,
      total: 47,
      page: 1,
      limit: 20,
      facets: demoFacets,
    });
  }
}
