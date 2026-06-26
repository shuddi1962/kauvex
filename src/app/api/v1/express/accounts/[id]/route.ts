import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const account = await (prisma as any).ksp_express_accounts.findUnique({
      where: { id },
      include: {
        ksp_express_team_members: true,
        ksp_express_account_stats: true,
        ksp_express_waybills: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ account });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch account" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await (prisma as any).ksp_express_accounts.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    const account = await (prisma as any).ksp_express_accounts.update({
      where: { id },
      data: {
        companyName: body.companyName ?? existing.companyName,
        companyEmail: body.companyEmail ?? existing.companyEmail,
        companyPhone: body.companyPhone ?? existing.companyPhone,
        businessType: body.businessType ?? existing.businessType,
        taxId: body.taxId ?? existing.taxId,
        address: body.address ?? existing.address,
        city: body.city ?? existing.city,
        state: body.state ?? existing.state,
        country: body.country ?? existing.country,
        postalCode: body.postalCode ?? existing.postalCode,
        plan: body.plan ?? existing.plan,
        status: body.status ?? existing.status,
        creditLimit: body.creditLimit ?? existing.creditLimit,
        settings: body.settings ?? existing.settings,
      },
    });

    return NextResponse.json({ account });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update account" },
      { status: 500 }
    );
  }
}
