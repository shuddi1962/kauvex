import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEMO_PRIVACY = {
  show_profile: true,
  show_purchases: false,
  allow_search: true,
  data_sharing: false,
};

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(DEMO_PRIVACY);
    }

    const { data, error } = await supabase
      .from("kv_user_privacy")
      .select("show_profile, show_purchases, allow_search, data_sharing")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(DEMO_PRIVACY);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(DEMO_PRIVACY);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ...DEMO_PRIVACY, ...body });
    }

    const updates: Record<string, boolean> = {};
    if (body.show_profile !== undefined) updates.show_profile = body.show_profile;
    if (body.show_purchases !== undefined) updates.show_purchases = body.show_purchases;
    if (body.allow_search !== undefined) updates.allow_search = body.allow_search;
    if (body.data_sharing !== undefined) updates.data_sharing = body.data_sharing;

    const { error } = await supabase
      .from("kv_user_privacy")
      .upsert({ user_id: user.id, ...updates });

    if (error) {
      return NextResponse.json({ ...DEMO_PRIVACY, ...body });
    }

    return NextResponse.json({ ...DEMO_PRIVACY, ...body });
  } catch {
    return NextResponse.json(DEMO_PRIVACY);
  }
}
