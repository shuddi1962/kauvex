import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (vendorId) where.vendorId = vendorId;
    if (status) where.status = status;
    if (type) where.type = type;

    const [campaigns, total] = await Promise.all([
      prisma.adCampaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: { _count: { select: { items: true, metrics: true } } },
      }),
      prisma.adCampaign.count({ where }),
    ]);

    return NextResponse.json({
      data: campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.vendorId || !body.name || !body.type || !body.budget || !body.startDate) {
      return NextResponse.json({ error: "Missing required fields: vendorId, name, type, budget, startDate" }, { status: 400 });
    }

    const campaign = await prisma.adCampaign.create({
      data: {
        vendorId: body.vendorId,
        name: body.name,
        type: body.type,
        status: body.status || "draft",
        budget: parseFloat(body.budget),
        budgetType: body.budgetType || "daily",
        bidAmount: body.bidAmount ? parseFloat(body.bidAmount) : 0,
        bidType: body.bidType || "cpc",
        targetType: body.targetType || "automatic",
        targetKeywords: body.targetKeywords || [],
        targetCategories: body.targetCategories || [],
        targetStorefronts: body.targetStorefronts || [],
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });

    if (body.items && Array.isArray(body.items)) {
      await prisma.adCampaignItem.createMany({
        data: body.items.map((item: Record<string, unknown>) => ({
          campaignId: campaign.id,
          productId: item.productId as string | undefined,
          storeId: item.storeId as string | undefined,
          brandId: item.brandId as string | undefined,
          adTitle: item.adTitle as string | undefined,
          adBody: item.adBody as string | undefined,
          imageUrl: item.imageUrl as string | undefined,
          targetUrl: item.targetUrl as string | undefined,
        })),
      });
    }

    const created = await prisma.adCampaign.findUnique({
      where: { id: campaign.id },
      include: { items: true },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
