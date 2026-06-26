import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lockerId,
      compartmentSize,
      waybillId,
      recipientName,
      recipientPhone,
      recipientEmail,
      pickupCode,
      expiresAt,
    } = body;

    if (!lockerId || !compartmentSize || !waybillId || !recipientName || !recipientPhone) {
      return NextResponse.json(
        { error: "lockerId, compartmentSize, waybillId, recipientName, and recipientPhone are required" },
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
      where: {
        lockerId,
        size: compartmentSize,
        status: "available",
      },
    });

    if (!compartment) {
      return NextResponse.json(
        { error: "No available compartment of this size" },
        { status: 409 }
      );
    }

    const generatedCode = pickupCode || Math.random().toString(36).substring(2, 8).toUpperCase();

    const [updatedCompartment, booking] = await Promise.all([
      (prisma as any).ksp_locker_compartments.update({
        where: { id: compartment.id },
        data: { status: "occupied", currentWaybillId: waybillId },
      }),
      (prisma as any).ksp_locker_bookings.create({
        data: {
          lockerId,
          compartmentId: compartment.id,
          waybillId,
          recipientName,
          recipientPhone,
          recipientEmail: recipientEmail || null,
          pickupCode: generatedCode,
          status: "pending",
          expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      }),
    ]);

    await (prisma as any).ksp_express_waybills.update({
      where: { id: waybillId },
      data: {
        lockerId,
        lockerCompartmentId: compartment.id,
        status: "locker_placed",
      },
    });

    return NextResponse.json({
      booking: {
        ...booking,
        compartment: {
          id: compartment.id,
          size: compartment.size,
          locker: locker.name,
          address: locker.address,
        },
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to book compartment" },
      { status: 500 }
    );
  }
}
