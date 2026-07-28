import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const db = createAdminClient();

    const { data: topic, error } = await db
      .from("kv_community_topics")
      .select("*, author:profiles!kv_community_topics_author_id_fkey(id, full_name, avatar_url), category:kv_community_categories(name, slug)")
      .eq("id", params.id)
      .single();

    if (error || !topic) return errorResponse("Topic not found", 404);

    const { data: replies } = await db
      .from("kv_community_replies")
      .select("*, author:profiles!kv_community_replies_author_id_fkey(id, full_name, avatar_url)")
      .eq("topic_id", params.id)
      .order("created_at", { ascending: true });

    return successResponse({ ...topic, replies: replies || [] });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const db = createAdminClient();

    const { data: topic } = await db
      .from("kv_community_topics")
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (!topic) return errorResponse("Topic not found", 404);
    if (topic.author_id !== user!.id) return errorResponse("Only the author can edit this topic", 403);

    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.body === "string") updates.body = body.body;

    const { data: updated, error } = await db
      .from("kv_community_topics")
      .update(updates)
      .eq("id", params.id)
      .select("*, author:profiles!kv_community_topics_author_id_fkey(id, full_name, avatar_url)")
      .single();

    if (error) return errorResponse(error.message, 400);

    return successResponse(updated);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const db = createAdminClient();

    const { data: topic } = await db
      .from("kv_community_topics")
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (!topic) return errorResponse("Topic not found", 404);
    if (topic.author_id !== user!.id) return errorResponse("Only the author can delete this topic", 403);

    const { error } = await db.from("kv_community_topics").delete().eq("id", params.id);

    if (error) return errorResponse(error.message, 400);

    return successResponse({ message: "Topic deleted" });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}