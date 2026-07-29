import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/insforge";
import { askKAI } from "@/lib/kai/rag";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId, sessionId, persona } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let convId = conversationId;
    const sessId = sessionId || `anon-${Date.now()}`;

    // Get or create conversation
    if (!convId) {
      const { data: newConv, error: convError } = await supabase
        .from("kv_kai_conversations")
        .insert({
          session_id: sessId,
          persona: persona || "sarah",
          is_active: true,
        })
        .select("id")
        .single();

      if (convError) throw convError;
      convId = newConv.id;
    }

    // Save user message
    await supabase.from("kv_kai_messages").insert({
      conversation_id: convId,
      role: "user",
      content: message,
    });

    // Get recent conversation history
    const { data: recentMessages } = await supabase
      .from("kv_kai_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: false })
      .limit(10);

    const history = (recentMessages || []).reverse().map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // Ask KAI
    const result = await askKAI(message, {
      conversationHistory: history.slice(0, -1), // exclude current message
    });

    // Save assistant message
    const { data: savedMsg, error: msgError } = await supabase
      .from("kv_kai_messages")
      .insert({
        conversation_id: convId,
        role: "assistant",
        content: result.answer,
        sources: result.sources.map((s) => ({
          chunk_id: s.id,
          title: s.title,
          score: s.similarity,
        })),
        tokens_used: result.tokensUsed,
        latency_ms: 0,
      })
      .select("id")
      .single();

    if (msgError) throw msgError;

    // Update conversation message count via raw SQL
    await supabase.rpc("kv_kai_increment_message_count", { conv_id: convId })
      .catch(() => {});

    return NextResponse.json({
      reply: result.answer,
      conversationId: convId,
      sources: result.sources.map((s) => ({
        title: s.title,
        category: s.category,
        similarity: Math.round(s.similarity * 100),
      })),
      messageId: savedMsg?.id,
    });
  } catch (err: any) {
    console.error("[KAI] Chat error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}