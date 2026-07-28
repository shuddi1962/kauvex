import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

export async function GET() {
  try {
    const db = createAdminClient();
    const { data: categories, error } = await db
      .from("kv_community_categories")
      .select("*, topics:kv_community_topics(count)")
      .order("sort_order", { ascending: true });

    if (error) return errorResponse(error.message, 400);

    const result = (categories || []).map((cat: Record<string, unknown>) => ({
      ...cat,
      topicCount: Array.isArray(cat.topics) ? (cat.topics as Record<string, unknown>[]).length : 0,
    }));

    return successResponse(result);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}