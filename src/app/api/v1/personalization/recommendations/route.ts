import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-helpers";
import { getRecommendedProducts, getTrendingProducts, getRelatedProducts } from "@/lib/personalization/engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "homepage";
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const currentProductId = searchParams.get("currentProductId");

    const validTypes = ["homepage", "product_page", "search"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` }, { status: 400 });
    }

    const { user } = await getAuthUser(request);

    if (type === "product_page" && currentProductId) {
      const related = await getRelatedProducts(currentProductId, limit);
      return NextResponse.json({ data: related });
    }

    if (user) {
      const recommendations = await getRecommendedProducts(user.id, type, limit, currentProductId);
      if (recommendations.length > 0) {
        return NextResponse.json({ data: recommendations });
      }
    }

    const trending = await getTrendingProducts(null, limit);
    return NextResponse.json({ data: trending });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
