import { prisma } from '@/lib/prisma'
import { earnPoints } from '@/lib/loyalty'

export async function checkReferralMilestones(customerId: string): Promise<string[]> {
  const unlocked: string[] = []

  const referralCount = await prisma.referralReward.count({
    where: { referrerId: customerId, status: 'completed' },
  })

  const milestones = await prisma.referralMilestone.findMany({
    where: { isActive: true, referralsRequired: { lte: referralCount } },
  })

  for (const milestone of milestones) {
    const existing = await prisma.userReferralMilestone.findUnique({
      where: { customerId_milestoneId: { customerId, milestoneId: milestone.id } },
    })

    if (!existing) {
      await prisma.userReferralMilestone.create({
        data: { customerId, milestoneId: milestone.id, unlockedAt: new Date(), claimed: false },
      })
      unlocked.push(milestone.label)

      if (milestone.rewardType === 'wallet') {
        const profile = await prisma.profile.findUnique({ where: { id: customerId } })
        const currentWallet = profile?.walletBalance?.toNumber() ?? 0
        await prisma.profile.update({
          where: { id: customerId },
          data: { walletBalance: currentWallet + milestone.rewardValue.toNumber() },
        })
      } else if (milestone.rewardType === 'points') {
        await earnPoints(customerId, `milestone-${milestone.id}`, milestone.rewardValue.toNumber())
      }
    }
  }

  return unlocked
}

export async function getReferralMilestones(customerId: string) {
  const [milestones, userMilestones, referralCount] = await Promise.all([
    prisma.referralMilestone.findMany({ where: { isActive: true }, orderBy: { referralsRequired: 'asc' } }),
    prisma.userReferralMilestone.findMany({ where: { customerId } }),
    prisma.referralReward.count({ where: { referrerId: customerId, status: 'completed' } }),
  ])

  const claimedMap = new Map(userMilestones.map(um => [um.milestoneId, um]))

  return {
    referralCount,
    milestones: milestones.map(m => ({
      id: m.id,
      referralsRequired: m.referralsRequired,
      label: m.label,
      rewardType: m.rewardType,
      rewardValue: m.rewardValue.toNumber(),
      rewardLabel: m.rewardLabel,
      unlocked: claimedMap.has(m.id),
      claimed: claimedMap.get(m.id)?.claimed ?? false,
      unlockedAt: claimedMap.get(m.id)?.unlockedAt.toISOString() ?? null,
    })),
  }
}
