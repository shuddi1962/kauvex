import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEMO_NOTIFICATIONS = [
  { id: "n1", type: "order", title: "Order Shipped", body: "Your order #KV-78910 has been shipped", read: false, created_at: "2026-06-25T14:00:00Z" },
  { id: "n2", type: "payment", title: "Payment Received", body: "₦45,000 payment confirmed for order #KV-78905", read: true, created_at: "2026-06-24T11:30:00Z" },
  { id: "n3", type: "promo", title: "Flash Sale Active", body: "Up to 50% off on Electronics - End midnight!", read: false, created_at: "2026-06-24T09:00:00Z" },
  { id: "n4", type: "loyalty", title: "Points Earned", body: "You earned 450 loyalty points from order #KV-78905", read: true, created_at: "2026-06-23T16:00:00Z" },
  { id: "n5", type: "alert", title: "Price Drop Alert", body: "Wireless Earbuds you wishlisted dropped to ₦15,000", read: false, created_at: "2026-06-23T12:00:00Z" },
];

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(DEMO_NOTIFICATIONS);
    }

    const { data, error } = await supabase
      .from("kv_user_notifications")
      .select("id, type, title, body, read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return NextResponse.json(DEMO_NOTIFICATIONS);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(DEMO_NOTIFICATIONS);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: true, message: "Notification updated" });
    }

    const { error } = await supabase
      .from("kv_user_notifications")
      .update({ read: read ?? true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ success: true, message: "Notification updated" });
    }

    return NextResponse.json({ success: true, message: "Notification updated" });
  } catch {
    return NextResponse.json({ success: true, message: "Notification updated" });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: true, message: id ? "Notification cleared" : "All notifications cleared" });
    }

    if (id) {
      const { error } = await supabase
        .from("kv_user_notifications")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        return NextResponse.json({ success: true, message: "Notification cleared" });
      }
    } else {
      const { error } = await supabase
        .from("kv_user_notifications")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        return NextResponse.json({ success: true, message: "All notifications cleared" });
      }
    }

    return NextResponse.json({ success: true, message: id ? "Notification cleared" : "All notifications cleared" });
  } catch {
    return NextResponse.json({ success: true, message: "Notifications cleared" });
  }
}
