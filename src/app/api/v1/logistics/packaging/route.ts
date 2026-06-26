import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("countryCode");
    if (!countryCode) {
      return NextResponse.json({ error: "countryCode required" }, { status: 400 });
    }

    const fees = await (prisma as any).glxPackagingFee.findMany({
      where: { countryCode, isActive: true },
      orderBy: [{ packagingType: "asc" }, { fee: "asc" }],
    });
    return NextResponse.json({ data: fees });
  } catch {
    return NextResponse.json({ error: "Failed to fetch packaging fees" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fee = await (prisma as any).glxPackagingFee.create({ data: body });
    return NextResponse.json({ data: fee });
  } catch {
    return NextResponse.json({ error: "Failed to save packaging fee" }, { status: 500 });
  }
}
