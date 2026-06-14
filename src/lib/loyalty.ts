import { prisma } from './prisma'

export type TierName = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export interface LoyaltyTierConfig {
  name: TierName
  minPoints: number
  multiplier: number
  benefits: string[]
}

export const TIER_CONFIGS: LoyaltyTierConfig[] = [
  {
    name: 'bronze',
    minPoints: 0,
    multiplier: 1,
    benefits: ['Free Shipping'],
  },
  {
    name: 'silver',
    minPoints: 500,
    multiplier: 1.2,
    benefits: ['Free Shipping', '2% Cashback'],
  },
  {
    name: 'gold',
    minPoints: 1500,
    multiplier: 1.5,
    benefits: ['Free Shipping', '5% Cashback', 'Exclusive Coupons'],
  },
  {
    name: 'platinum',
    minPoints: 5000,
    multiplier: 2,
    benefits: ['Free Shipping', '8% Cashback', 'Exclusive Coupons', 'Priority Support'],
  },
  {
    name: 'diamond',
    minPoints: 15000,
    multiplier: 3,
    benefits: ['Free Shipping', '10% Cashback', 'Exclusive Coupons', 'Priority Support', 'Early Access', 'VIP Offers'],
  },
]

export async function earnPoints(customerId: string, orderId: string, orderTotal: number): Promise<void> {
  const program = await prisma.loyaltyProgram.findFirst({ where: { isActive: true } })
  if (!program) return

  const profile = await prisma.profile.findUnique({ where: { id: customerId } })
  if (!profile) return

  const tier = await prisma.loyaltyTier.findFirst({
    where: { programId: program.id, name: profile.loyaltyTier ?? 'bronze' },
  })

  const multiplier = tier?.pointsMultiplier.toNumber() ?? 1
  const points = Math.floor(orderTotal * program.pointsPerDollar.toNumber() * multiplier)
  if (points <= 0) return

  const currentPoints = profile.loyaltyPoints ?? 0

  await prisma.$transaction([
    prisma.loyaltyTransaction.create({
      data: {
        programId: program.id,
        customerId,
        type: 'earned',
        points,
        balanceBefore: currentPoints,
        balanceAfter: currentPoints + points,
        referenceType: 'order',
        referenceId: orderId,
        description: `Earned from order ${orderId}`,
        expiresAt: program.expiryDays ? new Date(Date.now() + program.expiryDays * 86400000) : null,
      },
    }),
    prisma.profile.update({
      where: { id: customerId },
      data: { loyaltyPoints: currentPoints + points },
    }),
  ])

  await checkTierUpgrade(customerId)
}

export async function redeemPoints(customerId: string, points: number, orderId: string): Promise<number> {
  const program = await prisma.loyaltyProgram.findFirst({ where: { isActive: true } })
  if (!program) throw new Error('No active loyalty program')

  const profile = await prisma.profile.findUnique({ where: { id: customerId } })
  if (!profile) throw new Error('Customer not found')

  const currentPoints = profile.loyaltyPoints ?? 0
  if (currentPoints < points) throw new Error('Insufficient loyalty points')

  if (points < program.minRedeemPoints) {
    throw new Error(`Minimum redeem threshold is ${program.minRedeemPoints} points`)
  }

  const dollarValue = Math.round(points * program.dollarPerPoint.toNumber() * 100) / 100

  await prisma.$transaction([
    prisma.loyaltyTransaction.create({
      data: {
        programId: program.id,
        customerId,
        type: 'redeemed',
        points: -points,
        balanceBefore: currentPoints,
        balanceAfter: currentPoints - points,
        referenceType: 'order',
        referenceId: orderId,
        description: `Redeemed ${points} points for order ${orderId}`,
      },
    }),
    prisma.profile.update({
      where: { id: customerId },
      data: { loyaltyPoints: currentPoints - points },
    }),
  ])

  return dollarValue
}

export async function getCustomerLoyalty(customerId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: customerId } })
  if (!profile) throw new Error('Customer not found')

  const program = await prisma.loyaltyProgram.findFirst({ where: { isActive: true } })
  const currentPoints = profile.loyaltyPoints ?? 0
  const currentTier = profile.loyaltyTier ?? 'bronze'

  const tiers = await prisma.loyaltyTier.findMany({
    where: { programId: program?.id },
    orderBy: { minPoints: 'asc' },
  })

  const nextTier = tiers.find(t => t.minPoints > currentPoints && t.name !== currentTier)
  const pointsToNext = nextTier ? nextTier.minPoints - currentPoints : null

  const transactions = await prisma.loyaltyTransaction.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return {
    currentPoints,
    currentTier,
    pointsToNext,
    nextTierName: nextTier?.name ?? null,
    transactions,
  }
}

export async function checkTierUpgrade(customerId: string): Promise<void> {
  const profile = await prisma.profile.findUnique({ where: { id: customerId } })
  if (!profile) return

  const currentPoints = profile.loyaltyPoints ?? 0
  const program = await prisma.loyaltyProgram.findFirst({ where: { isActive: true } })
  if (!program) return

  const tiers = await prisma.loyaltyTier.findMany({
    where: { programId: program.id },
    orderBy: { minPoints: 'desc' },
  })

  const qualifiedTier = tiers.find(t => currentPoints >= t.minPoints)
  if (!qualifiedTier) return

  if (qualifiedTier.name !== profile.loyaltyTier) {
    await prisma.profile.update({
      where: { id: customerId },
      data: { loyaltyTier: qualifiedTier.name },
    })
  }
}

export async function getTierBenefits(tierName: string) {
  const config = TIER_CONFIGS.find(t => t.name === tierName)
  if (!config) return null

  const dbTier = await prisma.loyaltyTier.findFirst({
    where: { name: tierName },
    include: { program: true },
  })

  return {
    name: config.name,
    minPoints: config.minPoints,
    multiplier: config.multiplier,
    benefits: config.benefits,
    dbBenefits: (dbTier?.benefits as Record<string, unknown> | null) ?? null,
  }
}

export async function expireOldPoints(): Promise<number> {
  const now = new Date()
  const expiredTransactions = await prisma.loyaltyTransaction.findMany({
    where: {
      type: 'earned',
      expiresAt: { lte: now, not: null },
    },
  })

  if (expiredTransactions.length === 0) return 0

  const customerPoints = new Map<string, number>()
  for (const tx of expiredTransactions) {
    const current = customerPoints.get(tx.customerId) ?? 0
    customerPoints.set(tx.customerId, current + tx.points)
  }

  const programId = expiredTransactions[0].programId
  const operations: Array<ReturnType<typeof prisma.loyaltyTransaction.create>> = []

  for (const [customerId, totalPoints] of customerPoints) {
    const profile = await prisma.profile.findUnique({ where: { id: customerId } })
    const currentPoints = (profile?.loyaltyPoints ?? 0) - totalPoints

    operations.push(
      prisma.loyaltyTransaction.create({
        data: {
          programId,
          customerId,
          type: 'expired',
          points: -totalPoints,
          balanceBefore: currentPoints + totalPoints,
          balanceAfter: Math.max(0, currentPoints),
          description: `${totalPoints} points expired`,
        },
      }) as any
    )

    operations.push(
      prisma.profile.update({
        where: { id: customerId },
        data: { loyaltyPoints: Math.max(0, currentPoints) },
      }) as any
    )
  }

  await prisma.$transaction(operations)

  return expiredTransactions.length
}
