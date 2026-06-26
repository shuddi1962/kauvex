import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createExpressAccount } from "@/lib/shipping/express-accounts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;

    const [accounts, total] = await Promise.all([
      (prisma as any).ksp_express_accounts.findMany({
        where,
        include: {
          ksp_express_team_members: true,
          ksp_express_account_stats: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      (prisma as any).ksp_express_accounts.count({ where }),
    ]);

    return NextResponse.json({
      accounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      companyName,
      companyEmail,
      companyPhone,
      businessType,
      taxId,
      address,
      city,
      state,
      country,
      postalCode,
      plan,
    } = body;

    if (!userId || !companyName || !companyEmail) {
      return NextResponse.json(
        { error: "userId, companyName, and companyEmail are required" },
        { status: 400 }
      );
    }

    const account = await createExpressAccount({
      userId,
      companyName,
      companyEmail,
      companyPhone,
      businessType,
      taxId,
      address,
      city,
      state,
      country,
      postalCode,
      plan,
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
