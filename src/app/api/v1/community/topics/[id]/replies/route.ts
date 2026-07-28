import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, paginatedResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const createReplySchema = z.object({
  body: z.string().min(1).max(10000),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const db = createAdminClient();
    const { searchParams } = new URL(_request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    const { data: replies, error, count } = await db
      .from("kv_community_replies")
      .select("*, author:profiles!kv_community_replies_author_id_fkey(id, full_name, avatar_url)", { count: "exact" })
      .eq("topic_id", params.id)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message, 400);

    return paginatedResponse(replies || [], count || 0, page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createReplySchema);
  if (valErr) return valErr;

  try {
    const db = createAdminClient();

    const { data: topic } = await db
      .from("kv_community_topics")
      .select("id, is_locked")
      .eq("id", params.id)
      .single();

    if (!topic) return errorResponse("Topic not found", 404);
    if (topic.is_locked) return errorResponse("This topic is locked", 403);

    const { data: reply, error } = await db
      .from("kv_community_replies")
      .insert({
        topic_id: params.id,
        author_id: user!.id,
        body: body!.body,
      })
      .select("*, author:profiles!kv_community_replies_author_id_fkey(id, full_name, avatar_url)")
      .single();

    if (error) return errorResponse(error.message, 400);

    const { count: replyCount } = await db
      .from("kv_community_replies")
      .select("id", { count: "exact", head: true })
      .eq("topic_id", params.id);

    await db
      .from("kv_community_topics")
      .update({
        reply_count: replyCount || 0,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    return successResponse(reply, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}