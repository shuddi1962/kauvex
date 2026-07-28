import { NextRequest, NextResponse } from "next/server";
import { getVendorConversations, createConversation, getUnreadCount } from "@/lib/vendor/messaging";

export async function GET(req: NextRequest) {
  try {
    const vendorId = req.headers.get("x-vendor-id") || "demo-vendor";
    const conversations = await getVendorConversations(vendorId);
    const unread = await getUnreadCount(vendorId);
    return NextResponse.json({ conversations, unread });
  } catch {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { vendorId, customerId, title, orderId } = await req.json();
    if (!vendorId || !customerId || !title) {
      return NextResponse.json({ error: "vendorId, customerId, and title required" }, { status: 400 });
    }
    const conversation = await createConversation(vendorId, customerId, title, orderId);
    return NextResponse.json(conversation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}