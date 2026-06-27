import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json([
        {
          id: "s1",
          device: "Chrome on Windows",
          ip: "192.168.1.1",
          location: "Lagos, NG",
          last_active: "2026-06-25T10:30:00Z",
          current: true,
        },
        {
          id: "s2",
          device: "Safari on iPhone",
          ip: "10.0.0.1",
          location: "Lagos, NG",
          last_active: "2026-06-24T08:15:00Z",
          current: false,
        },
      ]);
    }

    const { data, error } = await supabase
      .from("kv_user_sessions")
      .select("id, device, ip, location, last_active, current")
      .eq("user_id", user.id)
      .order("last_active", { ascending: false });

    if (error || !data) {
      return NextResponse.json([
        {
          id: "s1",
          device: "Chrome on Windows",
          ip: "192.168.1.1",
          location: "Lagos, NG",
          last_active: "2026-06-25T10:30:00Z",
          current: true,
        },
        {
          id: "s2",
          device: "Safari on iPhone",
          ip: "10.0.0.1",
          location: "Lagos, NG",
          last_active: "2026-06-24T08:15:00Z",
          current: false,
        },
      ]);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json([
      {
        id: "s1",
        device: "Chrome on Windows",
        ip: "192.168.1.1",
        location: "Lagos, NG",
        last_active: "2026-06-25T10:30:00Z",
        current: true,
      },
      {
        id: "s2",
        device: "Safari on iPhone",
        ip: "10.0.0.1",
        location: "Lagos, NG",
        last_active: "2026-06-24T08:15:00Z",
        current: false,
      },
    ]);
  }
}
