import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [
    totalConfigs,
    totalPrizes,
    totalSpins,
    todaySpins,
    totalAchievements,
    totalUnlocked,
    totalShares,
    totalMilestones,
  ] = await Promise.all([
    prisma.spinWheelConfig.count(),
    prisma.spinWheelPrize.count(),
    prisma.spinWheelSpin.count(),
    prisma.spinWheelSpin.count({ where: { spunAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.achievement.count({ where: { isActive: true } }),
    prisma.userAchievement.count({ where: { unlockedAt: { not: null } } }),
    prisma.socialShare.count(),
    prisma.referralMilestone.count({ where: { isActive: true } }),
  ])

  const dailyCheckins = await prisma.dailyCheckIn.groupBy({
    by: ['checkInDate'],
    _count: true,
    orderBy: { checkInDate: 'desc' },
    take: 7,
  })

  return NextResponse.json({
    stats: {
      spinConfigs: totalConfigs,
      prizes: totalPrizes,
      totalSpins,
      todaySpins,
      achievements: totalAchievements,
      unlockedAchievements: totalUnlocked,
      socialShares: totalShares,
      milestones: totalMilestones,
    },
    dailyCheckins: dailyCheckins.map(d => ({
      date: d.checkInDate.toISOString().slice(0, 10),
      count: d._count,
    })),
  })
}
