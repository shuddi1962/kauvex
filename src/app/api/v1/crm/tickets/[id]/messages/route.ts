import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticket = await prisma.crmTicket.findUnique({
      where: { id: params.id },
      select: { id: true, customerId: true },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    if (ticket.customerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.crmTicketMessage.findMany({
      where: { ticketId: params.id, isInternal: false },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: messages });
  } catch (error: any) {
    console.error("[CRM Messages GET]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ticket = await prisma.crmTicket.findUnique({
      where: { id: params.id },
      select: { id: true, customerId: true, status: true },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    if (ticket.customerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (ticket.status === "closed") {
      return NextResponse.json({ error: "Cannot add messages to a closed ticket" }, { status: 400 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const newMessage = await prisma.crmTicketMessage.create({
      data: {
        ticketId: params.id,
        senderId: user.id,
        senderRole: "customer",
        senderName: user.user_metadata?.name || user.email,
        message: message.trim(),
      },
    });

    await prisma.crmTicket.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ data: newMessage }, { status: 201 });
  } catch (error: any) {
    console.error("[CRM Messages POST]", error);
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}
