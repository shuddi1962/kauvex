import { NextResponse } from "next/server";

const CATEGORIES = [
  { id: "order_issue", label: "Order Issue", description: "Problems with an existing order" },
  { id: "payment", label: "Payment", description: "Payment failures, refunds, billing" },
  { id: "delivery", label: "Delivery", description: "Shipping delays, tracking, address changes" },
  { id: "account", label: "Account", description: "Login, profile, security settings" },
  { id: "other", label: "Other", description: "General inquiries & feedback" },
];

export async function GET() {
  return NextResponse.json({ data: CATEGORIES });
}
