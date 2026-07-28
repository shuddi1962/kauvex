import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const CATEGORIES = ["order_issue", "payment", "delivery", "account", "other"] as const;

function generateTicketNumber(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `KVX-${digits}`;
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { subject, description, category, orderId, priority } = body;

    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!description || !description.trim()) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }
    if (category && !CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    let ticketNumber: string;
    let attempts = 0;
    do {
      ticketNumber = generateTicketNumber();
      const existing = await prisma.crmTicket.findUnique({ where: { ticketNumber } });
      if (!existing) break;
      attempts++;
    } while (attempts < 5);

    const ticket = await prisma.crmTicket.create({
      data: {
        ticketNumber,
        customerId: user.id,
        customerEmail: user.email,
        subject: subject.trim(),
        description: description.trim(),
        category: category || "other",
        priority: priority || "normal",
        status: "open",
        orderId: orderId || null,
      },
    });

    await prisma.crmTicketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: user.id,
        senderRole: "customer",
        senderName: user.user_metadata?.name || user.email,
        message: description.trim(),
      },
    });

    return NextResponse.json({ data: ticket }, { status: 201 });
  } catch (error: any) {
    console.error("[CRM Tickets POST]", error);
    return NextResponse.json({ error: error.message || "Failed to create ticket" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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

    const tickets = await prisma.crmTicket.findMany({
      where: { customerId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { messages: true } } },
    });

    return NextResponse.json({ data: tickets });
  } catch (error: any) {
    console.error("[CRM Tickets GET]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tickets" }, { status: 500 });
  }
}
