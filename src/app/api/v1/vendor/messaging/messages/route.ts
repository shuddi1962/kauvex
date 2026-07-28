import { NextRequest, NextResponse } from "next/server";
import { getConversationMessages, sendMessage, markConversationRead } from "@/lib/vendor/messaging";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) return NextResponse.json({ error: "conversationId required" }, { status: 400 });

    const messages = await getConversationMessages(conversationId);
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { conversationId, senderId, message, senderRole } = await req.json();
    if (!conversationId || !senderId || !message) {
      return NextResponse.json({ error: "conversationId, senderId, and message required" }, { status: 400 });
    }
    const msg = await sendMessage(conversationId, senderId, message, senderRole);
    await markConversationRead(conversationId, senderId);
    return NextResponse.json(msg, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}