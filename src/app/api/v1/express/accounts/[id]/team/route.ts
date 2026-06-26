import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const members = await (prisma as any).ksp_express_team_members.findMany({
      where: { accountId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ members });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, role, permissions } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "name, email, and role are required" },
        { status: 400 }
      );
    }

    const existingMember = await (prisma as any).ksp_express_team_members.findFirst({
      where: { accountId: id, email },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Team member with this email already exists" },
        { status: 409 }
      );
    }

    const member = await (prisma as any).ksp_express_team_members.create({
      data: {
        accountId: id,
        name,
        email,
        phone,
        role,
        permissions: permissions || [],
        status: "active",
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add team member" },
      { status: 500 }
    );
  }
}
