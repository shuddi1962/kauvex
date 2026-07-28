import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const db = createAdminClient();

    const { data: topic } = await db
      .from("kv_community_topics")
      .select("id, view_count")
      .eq("id", params.id)
      .single();

    if (!topic) return errorResponse("Topic not found", 404);

    const { error } = await db
      .from("kv_community_topics")
      .update({ view_count: (topic.view_count || 0) + 1 })
      .eq("id", params.id);

    if (error) return errorResponse(error.message, 400);

    return successResponse({ view_count: (topic.view_count || 0) + 1 });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}