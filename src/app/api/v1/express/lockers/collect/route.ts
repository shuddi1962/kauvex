import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, pickupCode, waybillNumber } = body;

    if (!bookingId && !pickupCode && !waybillNumber) {
      return NextResponse.json(
        { error: "bookingId, pickupCode, or waybillNumber is required" },
        { status: 400 }
      );
    }

    let booking;
    if (bookingId) {
      booking = await (prisma as any).ksp_locker_bookings.findUnique({
        where: { id: bookingId },
        include: { ksp_lockers: true, ksp_locker_compartments: true },
      });
    } else if (pickupCode) {
      booking = await (prisma as any).ksp_locker_bookings.findFirst({
        where: { pickupCode },
        include: { ksp_lockers: true, ksp_locker_compartments: true },
      });
    } else if (waybillNumber) {
      const waybill = await (prisma as any).ksp_express_waybills.findFirst({
        where: { waybillNumber },
      });
      if (waybill?.lockerId) {
        booking = await (prisma as any).ksp_locker_bookings.findFirst({
          where: {
            lockerId: waybill.lockerId,
            waybillId: waybill.id,
            status: { in: ["pending", "placed"] },
          },
          include: { ksp_lockers: true, ksp_locker_compartments: true },
        });
      }
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status === "collected") {
      return NextResponse.json(
        { error: "Package already collected" },
        { status: 409 }
      );
    }

    if (new Date(booking.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Booking has expired" },
        { status: 410 }
      );
    }

    if (pickupCode && booking.pickupCode !== pickupCode) {
      return NextResponse.json(
        { error: "Invalid pickup code" },
        { status: 401 }
      );
    }

    const [updatedBooking, updatedCompartment] = await Promise.all([
      (prisma as any).ksp_locker_bookings.update({
        where: { id: booking.id },
        data: {
          status: "collected",
          collectedAt: new Date(),
        },
      }),
      (prisma as any).ksp_locker_compartments.update({
        where: { id: booking.compartmentId },
        data: {
          status: "available",
          currentWaybillId: null,
        },
      }),
    ]);

    if (booking.waybillId) {
      await (prisma as any).ksp_express_waybills.update({
        where: { id: booking.waybillId },
        data: {
          status: "delivered",
          deliveredAt: new Date(),
          deliveryMethod: "locker_collect",
        },
      });
    }

    return NextResponse.json({
      message: "Package collected successfully",
      booking: updatedBooking,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to collect package" },
      { status: 500 }
    );
  }
}
