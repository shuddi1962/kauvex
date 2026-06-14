import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.adCampaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = { campaignId: params.id };
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      where.date = dateFilter;
    }

    const metrics = await prisma.adMetric.findMany({
      where,
      orderBy: { date: "asc" },
    });

    const totals = { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 };
    for (const m of metrics) {
      totals.impressions += m.impressions;
      totals.clicks += m.clicks;
      totals.conversions += m.conversions;
      totals.spend += Number(m.spend);
      totals.revenue += Number(m.revenue);
    }

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
    const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;
    const cac = totals.conversions > 0 ? totals.spend / totals.conversions : 0;

    return NextResponse.json({
      data: {
        daily: metrics,
        totals,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        roas: parseFloat(roas.toFixed(2)),
        cac: parseFloat(cac.toFixed(2)),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch campaign metrics" }, { status: 500 });
  }
}
