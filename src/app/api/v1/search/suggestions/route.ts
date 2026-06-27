import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const demoSuggestions = [
  "wireless earbuds",
  "wireless mouse",
  "usb cable",
  "usb hub",
  "phone case",
  "phone charger",
  "laptop stand",
  "laptop bag",
];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const { data, error } = await supabase
      .from("kv_products")
      .select("name")
      .eq("status", "active")
      .ilike("name", `%${q}%`)
      .limit(8);

    if (error) throw error;

    const suggestions = [...new Set(data.map((p: { name: string }) => p.name.toLowerCase()))];
    return NextResponse.json({ suggestions });
  } catch {
    const q = "";
    try {
      const url = new URL(request.url);
      const qParam = url.searchParams.get("q") || "";
      const filtered = demoSuggestions.filter((s) => s.includes(qParam.toLowerCase()));
      return NextResponse.json({ suggestions: filtered.length ? filtered : demoSuggestions });
    } catch {
      return NextResponse.json({ suggestions: demoSuggestions });
    }
  }
}
