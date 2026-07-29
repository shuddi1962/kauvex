import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/insforge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, rating, feedbackText } = body;

    if (!messageId || !rating) {
      return NextResponse.json({ error: "messageId and rating are required" }, { status: 400 });
    }

    await supabase.from("kv_kai_feedback").insert({
      message_id: messageId,
      rating: Math.max(1, Math.min(5, rating)),
      feedback_text: feedbackText || null,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[KAI Feedback] Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}