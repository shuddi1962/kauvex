import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const link = await prisma.affiliateLink.findFirst({
      where: { userId: customerId },
    });

    if (!link) {
      return NextResponse.json({
        referralCode: null,
        referralLink: null,
        totalReferrals: 0,
        earnedRewards: 0,
        pendingRewards: 0,
        clicks: 0,
        conversions: 0,
      });
    }

    const rewards = await prisma.referralReward.findMany({
      where: { referrerId: customerId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      referralCode: link.code,
      referralLink: `${process.env.NEXT_PUBLIC_SITE_URL || "https://kauvex.com"}/ref/${link.code}`,
      totalReferrals: rewards.length,
      earnedRewards: rewards
        .filter((r) => r.status === "completed")
        .reduce((sum, r) => sum + Number(r.rewardAmount), 0),
      pendingRewards: rewards
        .filter((r) => r.status === "pending")
        .reduce((sum, r) => sum + Number(r.rewardAmount), 0),
      clicks: link.clicks ?? 0,
      conversions: link.conversions ?? 0,
      commissionRate: Number(link.commissionRate ?? 5),
      rewards,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get referral data: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, customerId } = body;

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    switch (action) {
      case "generate_code": {
        const existing = await prisma.affiliateLink.findFirst({
          where: { userId: customerId },
        });

        if (existing) {
          return NextResponse.json({
            referralCode: existing.code,
            referralLink: `${process.env.NEXT_PUBLIC_SITE_URL || "https://kauvex.com"}/ref/${existing.code}`,
          });
        }

        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 8; i++) {
          code += chars[Math.floor(Math.random() * chars.length)];
        }

        const link = await prisma.affiliateLink.create({
          data: {
            userId: customerId,
            code,
            commissionRate: 5,
          },
        });

        return NextResponse.json({
          referralCode: link.code,
          referralLink: `${process.env.NEXT_PUBLIC_SITE_URL || "https://kauvex.com"}/ref/${link.code}`,
        });
      }

      case "track_click": {
        const code = body.referralCode;
        if (code) {
          await prisma.affiliateLink.updateMany({
            where: { code },
            data: { clicks: { increment: 1 } },
          });
        }
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to process referral: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
