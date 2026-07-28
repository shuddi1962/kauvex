import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { user } = await getAuthUser(request);
    const body = await request.json();
    const { eventType, eventData, productId, categoryId, pageUrl, referrer } = body;

    if (!eventType) {
      return NextResponse.json({ error: "eventType is required" }, { status: 400 });
    }

    const validTypes = ["page_view", "product_view", "add_to_cart", "purchase", "search", "category_view"];
    if (!validTypes.includes(eventType)) {
      return NextResponse.json({ error: `Invalid eventType. Must be one of: ${validTypes.join(", ")}` }, { status: 400 });
    }

    const sessionId = body.sessionId || (user ? null : crypto.randomUUID());

    const event = await prisma.$queryRaw`
      INSERT INTO kv_pers_user_events (user_id, session_id, event_type, event_data, product_id, category_id, page_url, referrer)
      VALUES (${user?.id || null}, ${sessionId}, ${eventType}, ${JSON.stringify(eventData || {})}::jsonb, ${productId || null}, ${categoryId || null}, ${pageUrl || null}, ${referrer || null})
      RETURNING id
    `;

    return NextResponse.json({ data: { id: event[0]?.id } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
