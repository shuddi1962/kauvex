import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse } from "@/lib/api-helpers";

const VALID_SORTS = ["newest", "helpful", "highest", "lowest"] as const;

function anonymizeName(fullName: string | null): string {
  if (!fullName) return "Anonymous";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const db = createAdminClient();
    const { productId } = params;
    const { searchParams } = new URL(request.url);
    const sort = VALID_SORTS.includes(searchParams.get("sort") as typeof VALID_SORTS[number])
      ? (searchParams.get("sort") as typeof VALID_SORTS[number])
      : "newest";

    let query = db
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("status", "approved");

    switch (sort) {
      case "helpful":
        query = query.order("helpful_count", { ascending: false, nullsFirst: false });
        break;
      case "highest":
        query = query.order("rating", { ascending: false });
        break;
      case "lowest":
        query = query.order("rating", { ascending: true });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data: reviews, error } = await query;

    if (error) return errorResponse("Failed to fetch reviews", 500);

    const allReviews = reviews || [];

    const userIds = allReviews
      .map((r: any) => r.user_id)
      .filter(Boolean);

    let profileMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await db
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      if (profiles) {
        for (const p of profiles) {
          profileMap[p.id] = anonymizeName(p.full_name);
        }
      }
    }

    const reviewsWithAuthor = allReviews.map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      images: r.images || [],
      isVerified: r.is_verified,
      helpfulCount: r.helpful_count || 0,
      createdAt: r.created_at,
      author: {
        name: profileMap[r.user_id] || "Anonymous",
      },
    }));

    const totalCount = allReviews.length;
    const averageRating = totalCount > 0
      ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalCount
      : 0;

    const distribution = [5, 4, 3, 2, 1].map((stars) => {
      const count = allReviews.filter((r: any) => r.rating === stars).length;
      return {
        stars,
        count,
        percent: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      };
    });

    return successResponse({
      reviews: reviewsWithAuthor,
      stats: {
        totalCount,
        averageRating: Math.round(averageRating * 10) / 10,
        distribution,
      },
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
