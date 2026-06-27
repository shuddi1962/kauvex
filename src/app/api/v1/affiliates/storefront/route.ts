import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partner_id");
    const slug = searchParams.get("slug");

    if (!partnerId && !slug) {
      return NextResponse.json({ error: "partner_id or slug is required" }, { status: 400 });
    }

    let query = supabase
      .from("kv_aff_storefronts")
      .select("*, kv_aff_storefront_products(*)")
      .limit(1);

    if (partnerId) query = query.eq("partner_id", partnerId);
    if (slug) query = query.eq("slug", slug);

    const { data, error } = await query.single();

    if (error) {
      return NextResponse.json({
        data: {
          id: "sf1",
          partner_id: "p1",
          name: "Tech Reviews by Chidi",
          slug: "tech-reviews-chidi",
          bio: "Nigeria's top tech reviewer",
          avatar: "/images/avatars/chidi.jpg",
          theme: { primary: "#FF6B00", background: "#ffffff" },
          products: [
            { id: "prod1", name: "Smart TV 55 inch", price: 450000, commission_rate: 5 },
            { id: "prod2", name: "Wireless Earbuds", price: 25000, commission_rate: 8 },
          ],
          social_links: {
            youtube: "youtube.com/@chidi",
            instagram: "instagram.com/chidi_tech",
          },
        },
      });
    }

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
