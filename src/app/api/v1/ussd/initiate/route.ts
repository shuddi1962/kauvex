import { NextRequest, NextResponse } from "next/server";
import { initiateUssdPayment } from "@/lib/ussd/gateway";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountId, amount, currency, purpose, metadata } = body;

    if (!accountId || !amount) {
      return NextResponse.json({ error: "accountId and amount are required" }, { status: 400 });
    }

    const tx = await initiateUssdPayment({ accountId, amount, currency, purpose, metadata });
    return NextResponse.json(tx, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Initiation failed" }, { status: 500 });
  }
}