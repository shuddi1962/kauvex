import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.adCampaign.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        metrics: { orderBy: { date: "asc" } },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ data: campaign });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.adCampaign.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.budget !== undefined) updateData.budget = parseFloat(body.budget);
    if (body.budgetType !== undefined) updateData.budgetType = body.budgetType;
    if (body.bidAmount !== undefined) updateData.bidAmount = parseFloat(body.bidAmount);
    if (body.bidType !== undefined) updateData.bidType = body.bidType;
    if (body.targetType !== undefined) updateData.targetType = body.targetType;
    if (body.targetKeywords !== undefined) updateData.targetKeywords = body.targetKeywords;
    if (body.targetCategories !== undefined) updateData.targetCategories = body.targetCategories;
    if (body.targetStorefronts !== undefined) updateData.targetStorefronts = body.targetStorefronts;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;

    const campaign = await prisma.adCampaign.update({
      where: { id: params.id },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json({ data: campaign });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.adCampaign.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    await prisma.adMetric.deleteMany({ where: { campaignId: params.id } });
    await prisma.adCampaignItem.deleteMany({ where: { campaignId: params.id } });
    await prisma.adCampaign.delete({ where: { id: params.id } });

    return NextResponse.json({ data: { id: params.id, deleted: true } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
