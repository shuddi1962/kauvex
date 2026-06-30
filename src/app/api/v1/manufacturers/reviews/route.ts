import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const manufacturerId = searchParams.get("manufacturer_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = manufacturerId ? { manufacturerId } : {};

    const [reviews, total] = await Promise.all([
      prisma.mfgReview.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.mfgReview.count({ where }),
    ]);

    return NextResponse.json({
      data: reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, manufacturerId, rating, comment, buyerId, buyerName, buyerCountry, productType, orderValue } = body;

    if (!rating || !comment || !manufacturerId) {
      return NextResponse.json(
        { error: "Rating, comment, and manufacturer_id required" },
        { status: 400 }
      );
    }

    const review = await prisma.mfgReview.create({
      data: {
        orderId: orderId ?? null,
        manufacturerId,
        buyerId: buyerId ?? "anonymous",
        buyerName: buyerName ?? null,
        buyerCountry: buyerCountry ?? null,
        rating: parseInt(rating),
        comment,
        productType: productType ?? null,
        orderValue: orderValue ?? null,
      },
    });

    // Update manufacturer average rating
    const avgResult = await prisma.mfgReview.aggregate({
      where: { manufacturerId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    if (avgResult._avg.rating) {
      await prisma.mfgManufacturer.update({
        where: { id: manufacturerId },
        data: { ratingAverage: avgResult._avg.rating },
      });
    }

    return NextResponse.json({ data: review }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
