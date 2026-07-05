import { prisma } from '@/lib/prisma'
import { earnPoints } from '@/lib/loyalty'
import { updateProgress } from './achievements'

const SHARE_POINTS = 10
const DAILY_SHARE_LIMIT = 5

export async function recordShare(customerId: string, shareType: string, platform: string, referenceId?: string): Promise<{ pointsEarned: number; message: string }> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sharesToday = await prisma.socialShare.count({
    where: { customerId, createdAt: { gte: today } },
  })

  if (sharesToday >= DAILY_SHARE_LIMIT) {
    return { pointsEarned: 0, message: 'Daily share limit reached (5/day)' }
  }

  await prisma.socialShare.create({
    data: { customerId, shareType, platform, referenceId, pointsEarned: SHARE_POINTS },
  })

  await earnPoints(customerId, `share-${shareType}-${Date.now()}`, SHARE_POINTS)

  await updateProgress(customerId, 'social', 1)

  return { pointsEarned: SHARE_POINTS, message: `+${SHARE_POINTS} points for sharing!` }
}

export async function getShareStats(customerId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalShares, todayShares, pointsEarned] = await Promise.all([
    prisma.socialShare.count({ where: { customerId } }),
    prisma.socialShare.count({ where: { customerId, createdAt: { gte: today } } }),
    prisma.socialShare.aggregate({ where: { customerId }, _sum: { pointsEarned: true } }),
  ])

  return {
    totalShares,
    todayShares,
    dailyLimit: DAILY_SHARE_LIMIT,
    totalPointsEarned: pointsEarned._sum.pointsEarned ?? 0,
  }
}
