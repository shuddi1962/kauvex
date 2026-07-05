import { prisma } from '@/lib/prisma'
import { earnPoints } from '@/lib/loyalty'

const STREAK_POINTS = [5, 10, 15, 20, 25, 30, 50]
const STREAK_BONUS_DAY = 7

export interface CheckInResult {
  checkedIn: boolean
  streakDay: number
  pointsEarned: number
  bonusEarned: boolean
  totalPoints: number
  message: string
}

export async function dailyCheckIn(customerId: string): Promise<CheckInResult> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await prisma.dailyCheckIn.findUnique({
    where: { customerId_checkInDate: { customerId, checkInDate: today } },
  })
  if (existing) {
    const totalPoints = await getTotalPoints(customerId)
    return { checkedIn: false, streakDay: existing.streakDay, pointsEarned: 0, bonusEarned: false, totalPoints, message: 'Already checked in today!' }
  }

  const lastCheckIn = await prisma.dailyCheckIn.findFirst({
    where: { customerId },
    orderBy: { checkInDate: 'desc' },
  })

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const streakDay = (lastCheckIn && lastCheckIn.checkInDate.getTime() === yesterday.getTime())
    ? lastCheckIn.streakDay + 1
    : 1

  const tierIndex = Math.min(streakDay - 1, STREAK_POINTS.length - 1)
  const pointsEarned = STREAK_POINTS[tierIndex]
  const bonusEarned = streakDay % STREAK_BONUS_DAY === 0
  const bonusPoints = bonusEarned ? pointsEarned * 2 : 0
  const totalEarned = pointsEarned + bonusPoints

  await prisma.dailyCheckIn.create({
    data: { customerId, checkInDate: today, streakDay, pointsEarned: totalEarned, bonusEarned },
  })

  await earnPoints(customerId, `checkin-${today.toISOString().slice(0, 10)}`, totalEarned)

  await checkStreakAchievements(customerId, streakDay)

  const totalPoints = await getTotalPoints(customerId)

  return {
    checkedIn: true,
    streakDay,
    pointsEarned: totalEarned,
    bonusEarned,
    totalPoints,
    message: bonusEarned
      ? `Day ${streakDay} streak! Bonus doubled! +${totalEarned} points 🔥`
      : `Checked in! Day ${streakDay} streak. +${totalEarned} points`,
  }
}

export async function getCheckInStatus(customerId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [todayCheckIn, allCheckIns, totalPoints] = await Promise.all([
    prisma.dailyCheckIn.findUnique({
      where: { customerId_checkInDate: { customerId, checkInDate: today } },
    }),
    prisma.dailyCheckIn.findMany({
      where: { customerId },
      orderBy: { checkInDate: 'desc' },
      take: 7,
    }),
    getTotalPoints(customerId),
  ])

  const currentStreak = todayCheckIn?.streakDay ?? (allCheckIns[0]?.streakDay ?? 0)

  const weekDays = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const checked = allCheckIns.find(
      c => c.checkInDate.toISOString().slice(0, 10) === date.toISOString().slice(0, 10)
    )
    weekDays.push({
      date: date.toISOString().slice(0, 10),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      checkedIn: !!checked,
      bonusDay: (checked?.streakDay ?? 0) % STREAK_BONUS_DAY === 0 && !!checked,
    })
  }

  return {
    checkedInToday: !!todayCheckIn,
    currentStreak,
    pointsEarnedToday: todayCheckIn?.pointsEarned ?? 0,
    totalPoints,
    weekDays,
    nextReward: STREAK_POINTS[Math.min(currentStreak, STREAK_POINTS.length - 1)],
    nextBonusIn: STREAK_BONUS_DAY - (currentStreak % STREAK_BONUS_DAY),
  }
}

async function getTotalPoints(customerId: string): Promise<number> {
  const profile = await prisma.profile.findUnique({ where: { id: customerId } })
  return profile?.loyaltyPoints ?? 0
}

async function checkStreakAchievements(customerId: string, streakDay: number) {
  const streakThresholds = [3, 7, 14, 30, 60, 90, 180, 365]
  for (const threshold of streakThresholds) {
    if (streakDay === threshold) {
      const achievement = await prisma.achievement.findFirst({
        where: { code: `streak_${threshold}d`, isActive: true },
      })
      if (achievement) {
        const existing = await prisma.userAchievement.findUnique({
          where: { customerId_achievementId: { customerId, achievementId: achievement.id } },
        })
        if (!existing) {
          await prisma.userAchievement.create({
            data: { customerId, achievementId: achievement.id, progress: threshold, unlockedAt: new Date() },
          })
          if (achievement.pointsReward > 0) {
            await earnPoints(customerId, `achievement-${achievement.code}`, achievement.pointsReward)
          }
        }
      }
    }
  }
}
