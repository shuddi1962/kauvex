import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEMO_PREFS = {
  order_updates: true,
  promotions: true,
  payment: true,
  loyalty: true,
  price_alerts: true,
  newsletter: false,
  sms: false,
};

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(DEMO_PREFS);
    }

    const { data, error } = await supabase
      .from("kv_user_notification_preferences")
      .select("order_updates, promotions, payment, loyalty, price_alerts, newsletter, sms")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(DEMO_PREFS);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(DEMO_PREFS);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ...DEMO_PREFS, ...body });
    }

    const updates: Record<string, boolean> = {};
    if (body.order_updates !== undefined) updates.order_updates = body.order_updates;
    if (body.promotions !== undefined) updates.promotions = body.promotions;
    if (body.payment !== undefined) updates.payment = body.payment;
    if (body.loyalty !== undefined) updates.loyalty = body.loyalty;
    if (body.price_alerts !== undefined) updates.price_alerts = body.price_alerts;
    if (body.newsletter !== undefined) updates.newsletter = body.newsletter;
    if (body.sms !== undefined) updates.sms = body.sms;

    const { error } = await supabase
      .from("kv_user_notification_preferences")
      .upsert({ user_id: user.id, ...updates });

    if (error) {
      return NextResponse.json({ ...DEMO_PREFS, ...body });
    }

    return NextResponse.json({ ...DEMO_PREFS, ...body });
  } catch {
    return NextResponse.json(DEMO_PREFS);
  }
}
