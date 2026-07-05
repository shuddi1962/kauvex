import { prisma } from '@/lib/prisma'
import { earnPoints } from '@/lib/loyalty'

interface AchievementWithProgress {
  id: string
  code: string
  name: string
  description: string
  icon: string
  category: string
  threshold: number
  pointsReward: number
  badgeColor: string
  progress: number
  unlocked: boolean
  unlockedAt: string | null
}

export async function getAchievements(customerId: string): Promise<AchievementWithProgress[]> {
  const [achievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany({ where: { isActive: true }, orderBy: { threshold: 'asc' } }),
    prisma.userAchievement.findMany({ where: { customerId } }),
  ])

  const userMap = new Map(userAchievements.map(ua => [ua.achievementId, ua]))

  return achievements.map(a => {
    const ua = userMap.get(a.id)
    return {
      id: a.id,
      code: a.code,
      name: a.name,
      description: a.description,
      icon: a.icon,
      category: a.category,
      threshold: a.threshold,
      pointsReward: a.pointsReward,
      badgeColor: a.badgeColor,
      progress: ua?.progress ?? 0,
      unlocked: !!ua?.unlockedAt,
      unlockedAt: ua?.unlockedAt?.toISOString() ?? null,
    }
  })
}

export async function getUnlockedCount(customerId: string): Promise<number> {
  return prisma.userAchievement.count({
    where: { customerId, unlockedAt: { not: null } },
  })
}

export async function checkAndUnlock(customerId: string, category: string, currentValue: number): Promise<string[]> {
  const unlocked: string[] = []
  const achievements = await prisma.achievement.findMany({
    where: { category, isActive: true, threshold: { lte: currentValue } },
  })

  for (const achievement of achievements) {
    const existing = await prisma.userAchievement.upsert({
      where: { customerId_achievementId: { customerId, achievementId: achievement.id } },
      update: { progress: currentValue, unlockedAt: existing => existing.unlockedAt ?? new Date() },
      create: { customerId, achievementId: achievement.id, progress: currentValue, unlockedAt: new Date() },
    })

    if (existing.unlockedAt && !existing.notified) {
      unlocked.push(achievement.code)
      if (achievement.pointsReward > 0) {
        await earnPoints(customerId, `achievement-${achievement.code}`, achievement.pointsReward)
      }
      await prisma.userAchievement.update({
        where: { id: existing.id },
        data: { notified: true },
      })
    }
  }

  return unlocked
}

export async function updateProgress(customerId: string, category: string, increment: number = 1): Promise<string[]> {
  const achievement = await prisma.achievement.findFirst({
    where: { category, isActive: true },
    orderBy: { threshold: 'asc' },
  })
  if (!achievement) return []

  const ua = await prisma.userAchievement.upsert({
    where: { customerId_achievementId: { customerId, achievementId: achievement.id } },
    update: { progress: { increment } },
    create: { customerId, achievementId: achievement.id, progress: increment },
  })

  if (ua.progress >= achievement.threshold && !ua.unlockedAt) {
    await prisma.userAchievement.update({
      where: { id: ua.id },
      data: { unlockedAt: new Date(), notified: true },
    })
    if (achievement.pointsReward > 0) {
      await earnPoints(customerId, `achievement-${achievement.code}`, achievement.pointsReward)
    }
    return [achievement.code]
  }

  return []
}
