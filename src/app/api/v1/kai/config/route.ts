import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/insforge";
import { reindexAll } from "@/lib/kai/knowledge-base";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "chunks") {
      const { data } = await supabase
        .from("kv_kai_knowledge_chunks")
        .select("id, category, subcategory, title, content, is_active, created_at, embedding")
        .order("created_at", { ascending: false })
        .limit(200);

      const chunks = (data || []).map((c: any) => ({
        ...c,
        has_embedding: c.embedding !== null,
        embedding: undefined,
      }));

      return NextResponse.json({ chunks });
    }

    if (type === "conversations") {
      const { data } = await supabase
        .from("kv_kai_conversations")
        .select("id, session_id, persona, message_count, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(50);

      return NextResponse.json({ conversations: data || [] });
    }

    // Default: return config
    const { data } = await supabase
      .from("kv_kai_config")
      .select("*")
      .order("config_key");

    return NextResponse.json({ config: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    // Reindex all unembedded chunks
    if (action === "reindex") {
      const count = await reindexAll();
      return NextResponse.json({ success: true, count });
    }

    // Add new knowledge chunk
    if (action === "add_chunk") {
      const body = await request.json();
      const { data, error } = await supabase
        .from("kv_kai_knowledge_chunks")
        .insert({
          category: body.category || "platform",
          subcategory: body.subcategory || null,
          title: body.title,
          content: body.content,
          is_active: true,
        })
        .select("id")
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, id: data.id });
    }

    // Delete knowledge chunk
    if (action === "delete_chunk") {
      const id = searchParams.get("id");
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

      await supabase.from("kv_kai_knowledge_chunks").update({ is_active: false }).eq("id", id);
      return NextResponse.json({ success: true });
    }

    // Update config
    const body = await request.json();
    const { config_key, config_value } = body;

    if (!config_key || config_value === undefined) {
      return NextResponse.json({ error: "config_key and config_value required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("kv_kai_config")
      .upsert({ config_key, config_value, updated_at: new Date().toISOString() }, { onConflict: "config_key" });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}