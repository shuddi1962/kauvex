import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      waybillId,
      reason,
      description,
      photos,
      returnType,
      pickupAddress,
      pickupCity,
      pickupCountry,
    } = body;

    if (!waybillId || !reason) {
      return NextResponse.json(
        { error: "waybillId and reason are required" },
        { status: 400 }
      );
    }

    const waybill = await (prisma as any).ksp_express_waybills.findUnique({
      where: { id: waybillId },
    });

    if (!waybill) {
      return NextResponse.json({ error: "Waybill not found" }, { status: 404 });
    }

    const returnNumber = `KXR${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const returnRecord = await (prisma as any).ksp_returns.create({
      data: {
        returnNumber,
        originalWaybillId: waybillId,
        reason,
        description: description || null,
        photos: photos || [],
        returnType: returnType || "standard",
        status: "initiated",
        pickupAddress: pickupAddress || waybill.senderAddress,
        pickupCity: pickupCity || waybill.originCity,
        pickupCountry: pickupCountry || waybill.originCountry,
        returnLabel: null,
        returnCost: null,
      },
    });

    await (prisma as any).ksp_express_waybills.update({
      where: { id: waybillId },
      data: { hasReturn: true, returnId: returnRecord.id },
    });

    return NextResponse.json({ return: returnRecord }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create return" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const waybillId = searchParams.get("waybillId");
    const returnNumber = searchParams.get("returnNumber");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (returnNumber) {
      const returnRecord = await (prisma as any).ksp_returns.findFirst({
        where: { returnNumber },
        include: { ksp_express_waybills: true },
      });
      if (!returnRecord) {
        return NextResponse.json({ error: "Return not found" }, { status: 404 });
      }
      return NextResponse.json({ return: returnRecord });
    }

    const where: any = {};
    if (waybillId) where.originalWaybillId = waybillId;
    if (status) where.status = status;

    const [returns, total] = await Promise.all([
      (prisma as any).ksp_returns.findMany({
        where,
        include: { ksp_express_waybills: { select: { waybillNumber: true, senderName: true, recipientName: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      (prisma as any).ksp_returns.count({ where }),
    ]);

    return NextResponse.json({
      returns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch returns" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, returnCost, returnLabel, resolution } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await (prisma as any).ksp_returns.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    const returnRecord = await (prisma as any).ksp_returns.update({
      where: { id },
      data: {
        status: status ?? existing.status,
        returnCost: returnCost ?? existing.returnCost,
        returnLabel: returnLabel ?? existing.returnLabel,
        resolution: resolution ?? existing.resolution,
        resolvedAt: status === "completed" ? new Date() : existing.resolvedAt,
      },
    });

    return NextResponse.json({ return: returnRecord });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update return" },
      { status: 500 }
    );
  }
}
