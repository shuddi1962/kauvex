import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "@/lib/ussd/gateway";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Verify Paystack webhook signature
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY || "";

    if (signature) {
      const crypto = await import("crypto");
      const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(payload)).digest("hex");
      if (hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const result = await handleWebhook(payload);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Webhook failed" }, { status: 500 });
  }
}