import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const demoReturns = [
  {
    id: "RMA-001",
    order_id: "KV-78903",
    product: { name: "Wireless Mouse", image: "/products/mouse.jpg", sku: "WM-001" },
    reason: "Defective product",
    status: "approved",
    created_at: "2026-06-20",
    refund_amount: 12500,
    refund_method: "wallet",
  },
  {
    id: "RMA-002",
    order_id: "KV-78850",
    product: { name: "USB-C Hub", image: "/products/hub.jpg", sku: "CH-002" },
    reason: "Wrong item received",
    status: "pending",
    created_at: "2026-06-22",
    refund_amount: 8900,
    refund_method: "original",
  },
  {
    id: "RMA-003",
    order_id: "KV-78801",
    product: { name: "Phone Case", image: "/products/case.jpg", sku: "PC-003" },
    reason: "Changed mind",
    status: "rejected",
    created_at: "2026-06-18",
    refund_amount: 3500,
    refund_method: "wallet",
  },
];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("kv_returns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ returns: data });
  } catch {
    return NextResponse.json({ returns: demoReturns });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, product_id, reason, photos } = body;

    if (!order_id || !product_id || !reason) {
      return NextResponse.json(
        { error: "order_id, product_id, and reason are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("kv_returns")
      .insert({
        user_id: user.id,
        order_id,
        product_id,
        reason,
        photos: photos || [],
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ return_request: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        return_request: {
          id: "RMA-NEW",
          order_id: (await request.json().catch(() => ({}))).order_id || "KV-00000",
          status: "pending",
          created_at: new Date().toISOString().split("T")[0],
        },
      },
      { status: 201 }
    );
  }
}
