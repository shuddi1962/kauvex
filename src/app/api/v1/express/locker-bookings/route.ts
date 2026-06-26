import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const where: any = { userId };
    if (status) where.status = status;

    const bookings = await (prisma as any).ksp_locker_bookings.findMany({
      where,
      include: {
        ksp_locker_compartments: {
          include: { ksp_lockers: true },
        },
        ksp_express_waybills: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch locker bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lockerId, compartmentSize, waybillId, userId } = body;

    if (!lockerId || !compartmentSize || !waybillId || !userId) {
      return NextResponse.json(
        { error: "lockerId, compartmentSize, waybillId, and userId are required" },
        { status: 400 }
      );
    }

    const locker = await (prisma as any).ksp_lockers.findUnique({
      where: { id: lockerId },
    });
    if (!locker) {
      return NextResponse.json({ error: "Locker not found" }, { status: 404 });
    }

    const compartment = await (prisma as any).ksp_locker_compartments.findFirst({
      where: { lockerId, size: compartmentSize, status: "available" },
    });
    if (!compartment) {
      return NextResponse.json(
        { error: "No available compartment of this size" },
        { status: 409 }
      );
    }

    const pin = generatePin();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const [updatedCompartment, booking] = await Promise.all([
      (prisma as any).ksp_locker_compartments.update({
        where: { id: compartment.id },
        data: { status: "occupied" },
      }),
      (prisma as any).ksp_locker_bookings.create({
        data: {
          lockerId,
          compartmentId: compartment.id,
          waybillId,
          userId,
          pickupCode: pin,
          pin,
          status: "awaiting_delivery",
          expiresAt,
        },
      }),
    ]);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create locker booking" },
      { status: 500 }
    );
  }
}
