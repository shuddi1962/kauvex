import { NextRequest, NextResponse } from "next/server";
import { verifyUssdPayment } from "@/lib/ussd/gateway";

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();
    if (!reference) {
      return NextResponse.json({ error: "reference is required" }, { status: 400 });
    }

    const result = await verifyUssdPayment(reference);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}