import { NextRequest, NextResponse } from "next/server";
import { getUssdTransactions } from "@/lib/ussd/gateway";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20");
    const transactions = await getUssdTransactions(accountId, limit);
    return NextResponse.json({ transactions });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}