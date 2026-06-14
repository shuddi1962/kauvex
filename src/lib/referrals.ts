import crypto from 'crypto'
import { prisma } from './prisma'

function generateCode(customerId: string): string {
  const prefix = customerId.replace(/-/g, '').slice(0, 4)
  const random = crypto.randomBytes(2).toString('hex')
  return `${prefix}${random}`.toUpperCase()
}

export async function generateReferralCode(customerId: string): Promise<string> {
  const existing = await prisma.affiliateLink.findFirst({
    where: { userId: customerId },
  })

  if (existing) return existing.code

  let code: string
  let attempts = 0

  do {
    code = generateCode(customerId)
    const duplicate = await prisma.affiliateLink.findUnique({ where: { code } })
    if (!duplicate) break
    attempts++
  } while (attempts < 10)

  await prisma.affiliateLink.create({
    data: {
      userId: customerId,
      code,
      commissionRate: 5,
    },
  })

  return code
}

export async function getReferralLink(customerId: string): Promise<string> {
  const link = await prisma.affiliateLink.findFirst({
    where: { userId: customerId },
  })

  if (!link) {
    const code = await generateReferralCode(customerId)
    return `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kauvex.com'}/ref/${code}`
  }

  return `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kauvex.com'}/ref/${link.code}`
}

export async function processReferralSignup(referralCode: string, newCustomerId: string): Promise<void> {
  const link = await prisma.affiliateLink.findUnique({ where: { code: referralCode } })
  if (!link || !link.userId) throw new Error('Invalid referral code')

  if (link.userId === newCustomerId) throw new Error('Cannot refer yourself')

  const existingReward = await prisma.referralReward.findFirst({
    where: { referrerId: link.userId, referredId: newCustomerId, rewardType: 'signup' },
  })
  if (existingReward) throw new Error('Referral already processed for this user')

  const signupBonus = 10
  const referrerProfile = await prisma.profile.findUnique({ where: { id: link.userId } })
  const currentWallet = referrerProfile?.walletBalance?.toNumber() ?? 0

  await prisma.$transaction([
    prisma.referralReward.create({
      data: {
        referrerId: link.userId,
        referredId: newCustomerId,
        rewardType: 'signup',
        rewardAmount: signupBonus,
        status: 'completed',
        paidAt: new Date(),
      },
    }),
    prisma.profile.update({
      where: { id: link.userId },
      data: { walletBalance: currentWallet + signupBonus },
    }),
    prisma.customerWalletTransaction.create({
      data: {
        customerId: link.userId,
        type: 'referral_bonus',
        amount: signupBonus,
        balanceBefore: currentWallet,
        balanceAfter: currentWallet + signupBonus,
        referenceType: 'referral',
        description: `Signup referral bonus`,
        status: 'completed',
      },
    }),
    prisma.affiliateLink.update({
      where: { id: link.id },
      data: { conversions: { increment: 1 }, revenue: { increment: signupBonus } },
    }),
  ])
}

export async function processReferralPurchase(referralCode: string, orderId: string, orderTotal: number): Promise<void> {
  const link = await prisma.affiliateLink.findUnique({ where: { code: referralCode } })
  if (!link || !link.userId) throw new Error('Invalid referral code')

  const commissionRate = link.commissionRate?.toNumber() ?? 5
  const rewardAmount = Math.round(orderTotal * (commissionRate / 100) * 100) / 100

  const reward = await prisma.referralReward.findFirst({
    where: {
      referrerId: link.userId,
      rewardType: 'signup',
      referredId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
  })

  const referrerProfile = await prisma.profile.findUnique({ where: { id: link.userId } })
  const currentWallet = referrerProfile?.walletBalance?.toNumber() ?? 0

  await prisma.$transaction([
    prisma.referralReward.create({
      data: {
        referrerId: link.userId,
        orderId,
        rewardType: 'purchase',
        rewardAmount,
        status: 'completed',
        paidAt: new Date(),
      },
    }),
    prisma.profile.update({
      where: { id: link.userId },
      data: { walletBalance: currentWallet + rewardAmount },
    }),
    prisma.customerWalletTransaction.create({
      data: {
        customerId: link.userId,
        type: 'referral_commission',
        amount: rewardAmount,
        balanceBefore: currentWallet,
        balanceAfter: currentWallet + rewardAmount,
        referenceType: 'order',
        referenceId: orderId,
        description: `Purchase commission on order ${orderId}`,
        status: 'completed',
      },
    }),
    prisma.affiliateLink.update({
      where: { id: link.id },
      data: { revenue: { increment: rewardAmount } },
    }),
  ])

  if (reward && reward.status === 'pending') {
    await prisma.referralReward.update({
      where: { id: reward.id },
      data: { status: 'completed' },
    })
  }
}

export async function getReferralStats(customerId: string) {
  const link = await prisma.affiliateLink.findFirst({ where: { userId: customerId } })

  if (!link) {
    return {
      referralCode: null,
      referralLink: null,
      totalReferrals: 0,
      earnedRewards: 0,
      pendingRewards: 0,
    }
  }

  const rewards = await prisma.referralReward.findMany({
    where: { referrerId: customerId },
  })

  const totalReferrals = rewards.length
  const earnedRewards = rewards
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.rewardAmount.toNumber(), 0)
  const pendingRewards = rewards
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.rewardAmount.toNumber(), 0)

  return {
    referralCode: link.code,
    referralLink: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kauvex.com'}/ref/${link.code}`,
    totalReferrals,
    earnedRewards,
    pendingRewards,
    commissionRate: link.commissionRate?.toNumber() ?? 5,
    clicks: link.clicks ?? 0,
    conversions: link.conversions ?? 0,
  }
}
