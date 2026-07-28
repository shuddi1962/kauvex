import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const db = createAdminClient();
    const { id } = params;

    const { data: review, error: fetchErr } = await db
      .from("reviews")
      .select("id, user_id, helpful_count")
      .eq("id", id)
      .single();

    if (fetchErr || !review) {
      return errorResponse("Review not found", 404);
    }

    if (review.user_id === user!.id) {
      return errorResponse("You cannot vote on your own review", 403);
    }

    const newCount = (review.helpful_count || 0) + 1;

    const { data: updated, error: updateErr } = await db
      .from("reviews")
      .update({ helpful_count: newCount })
      .eq("id", id)
      .select("id, helpful_count")
      .single();

    if (updateErr) return errorResponse(updateErr.message, 400);

    return successResponse(updated);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
