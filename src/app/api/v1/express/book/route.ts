import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accountId,
      guestName,
      guestEmail,
      guestPhone,
      origin,
      destination,
      senderName,
      senderPhone,
      senderAddress,
      recipientName,
      recipientPhone,
      recipientAddress,
      items,
      weight,
      dimensions,
      serviceTier,
      insuranceValue,
      codAmount,
      specialInstructions,
      scheduledPickup,
      lockerId,
    } = body;

    if (!origin || !destination || !senderName || !senderPhone || !recipientName || !recipientPhone) {
      return NextResponse.json(
        { error: "origin, destination, senderName, senderPhone, recipientName, and recipientPhone are required" },
        { status: 400 }
      );
    }

    const waybillNumber = `KXP${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const baseRate = weight * 1200;
    const tierMultiplier = serviceTier === "express" ? 1.5 : serviceTier === "same-day" ? 2.5 : 1;
    const insuranceFee = insuranceValue ? insuranceValue * 0.01 : 0;
    const codFee = codAmount ? codAmount * 0.02 : 0;
    const totalCost = Math.round((baseRate * tierMultiplier + insuranceFee + codFee) * 100) / 100;

    const waybill = await (prisma as any).ksp_express_waybills.create({
      data: {
        waybillNumber,
        accountId: accountId || null,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        origin: typeof origin === "string" ? origin : origin.city || JSON.stringify(origin),
        destination: typeof destination === "string" ? destination : destination.city || JSON.stringify(destination),
        originAddress: typeof origin === "object" ? origin.address : null,
        destAddress: typeof destination === "object" ? destination.address : null,
        originCity: typeof origin === "object" ? origin.city : null,
        destCity: typeof destination === "object" ? destination.city : null,
        originCountry: typeof origin === "object" ? origin.country : null,
        destCountry: typeof destination === "object" ? destination.country : null,
        senderName,
        senderPhone,
        senderAddress,
        recipientName,
        recipientPhone,
        recipientAddress,
        items: items || [],
        weight,
        dimensions: dimensions || null,
        serviceTier: serviceTier || "standard",
        insuranceValue: insuranceValue || null,
        codAmount: codAmount || null,
        totalCost,
        status: "created",
        specialInstructions: specialInstructions || null,
        scheduledPickup: scheduledPickup ? new Date(scheduledPickup) : null,
        lockerId: lockerId || null,
      },
    });

    return NextResponse.json({ waybill }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create shipment" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const waybillNumber = searchParams.get("waybillNumber");
    const accountId = searchParams.get("accountId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (waybillNumber) {
      const waybill = await (prisma as any).ksp_express_waybills.findFirst({
        where: { waybillNumber },
      });
      if (!waybill) {
        return NextResponse.json({ error: "Waybill not found" }, { status: 404 });
      }
      return NextResponse.json({ waybill });
    }

    const where: any = {};
    if (accountId) where.accountId = accountId;

    const [waybills, total] = await Promise.all([
      (prisma as any).ksp_express_waybills.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      (prisma as any).ksp_express_waybills.count({ where }),
    ]);

    return NextResponse.json({
      waybills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch shipments" },
      { status: 500 }
    );
  }
}
