import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, paginatedResponse, getAuthUser, requireVendor, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const createTopicSchema = z.object({
  category_id: z.string().uuid(),
  title: z.string().min(5).max(200),
  body: z.string().min(20).max(50000),
});

export async function GET(request: NextRequest) {
  const { error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const db = createAdminClient();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;
    const categorySlug = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";

    let query = db
      .from("kv_community_topics")
      .select("*, author:profiles!kv_community_topics_author_id_fkey(id, full_name, avatar_url), category:kv_community_categories!inner(name, slug)", { count: "exact" });

    if (categorySlug) {
      query = query.eq("category.slug", categorySlug);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
    }

    const { data: topics, error, count } = await query
      .order("is_pinned", { ascending: false })
      .order("last_activity_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message, 400);

    return paginatedResponse(topics || [], count || 0, page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, vendor, error: authErr } = await requireVendor(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createTopicSchema);
  if (valErr) return valErr;

  try {
    const db = createAdminClient();

    const { data: category } = await db
      .from("kv_community_categories")
      .select("id")
      .eq("id", body!.category_id)
      .single();
    if (!category) return errorResponse("Category not found", 404);

    const { data: topic, error } = await db
      .from("kv_community_topics")
      .insert({
        category_id: body!.category_id,
        author_id: user!.id,
        title: body!.title,
        body: body!.body,
      })
      .select("*, author:profiles!kv_community_topics_author_id_fkey(id, full_name, avatar_url)")
      .single();

    if (error) return errorResponse(error.message, 400);

    return successResponse(topic, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}