import { prisma } from '@/lib/prisma'
import { earnPoints } from '@/lib/loyalty'

interface PrizeResult {
  prizeId: string
  label: string
  type: string
  value: string | null
  points: number
  discountPercent: number | null
  color: string
}

export async function spin(customerId: string): Promise<{ prize: PrizeResult; spinsRemaining: number; error?: string }> {
  const config = await prisma.spinWheelConfig.findFirst({ where: { isActive: true }, include: { prizes: { where: { isActive: true } } } })
  if (!config) return { prize: { prizeId: '', label: 'No active wheel', type: 'bad_luck', value: null, points: 0, discountPercent: null, color: '#666' }, spinsRemaining: 0, error: 'No active spin wheel' }
  if (config.prizes.length === 0) return { prize: { prizeId: '', label: 'No prizes', type: 'bad_luck', value: null, points: 0, discountPercent: null, color: '#666' }, spinsRemaining: 0, error: 'No prizes configured' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const spinsToday = await prisma.spinWheelSpin.count({
    where: { customerId, spunAt: { gte: today } },
  })

  const spinsRemaining = Math.max(0, config.spinsPerDay - spinsToday)

  if (spinsRemaining <= 0) {
    return { prize: { prizeId: '', label: 'No spins left', type: 'bad_luck', value: null, points: 0, discountPercent: null, color: '#666' }, spinsRemaining: 0, error: 'No spins remaining today' }
  }

  if (config.costInPoints > 0) {
    const profile = await prisma.profile.findUnique({ where: { id: customerId } })
    const currentPoints = profile?.loyaltyPoints ?? 0
    if (currentPoints < config.costInPoints) {
      return { prize: { prizeId: '', label: 'Not enough points', type: 'bad_luck', value: null, points: 0, discountPercent: null, color: '#666' }, spinsRemaining, error: `Need ${config.costInPoints} points to spin` }
    }
  }

  const prize = selectPrizeByWeight(config.prizes)

  if (config.costInPoints > 0) {
    await prisma.profile.update({
      where: { id: customerId },
      data: { loyaltyPoints: { decrement: config.costInPoints } },
    })
  }

  await prisma.spinWheelSpin.create({
    data: { configId: config.id, customerId, prizeId: prize.id, pointsWon: prize.points, isFree: config.costInPoints === 0 },
  })

  if (prize.points > 0) {
    await earnPoints(customerId, `spinwheel-${prize.id}-${Date.now()}`, prize.points)
  }

  const result: PrizeResult = {
    prizeId: prize.id,
    label: prize.label,
    type: prize.type,
    value: prize.value,
    points: prize.points,
    discountPercent: prize.discountPercent?.toNumber() ?? null,
    color: prize.color,
  }

  return { prize: result, spinsRemaining: spinsRemaining - 1 }
}

export async function getSpinStatus(customerId: string) {
  const config = await prisma.spinWheelConfig.findFirst({ where: { isActive: true }, include: { prizes: { where: { isActive: true } } } })
  if (!config) return { active: false, spinsRemaining: 0, spinsPerDay: 0, prizes: [], costInPoints: 0 }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const spinsToday = await prisma.spinWheelSpin.count({
    where: { customerId, spunAt: { gte: today } },
  })

  return {
    active: true,
    spinsRemaining: Math.max(0, config.spinsPerDay - spinsToday),
    spinsPerDay: config.spinsPerDay,
    prizes: config.prizes.map(p => ({
      id: p.id,
      label: p.label,
      type: p.type,
      value: p.value,
      points: p.points,
      discountPercent: p.discountPercent?.toNumber() ?? null,
      color: p.color,
      weight: p.weight,
    })),
    costInPoints: config.costInPoints,
  }
}

function selectPrizeByWeight(prizes: { id: string; label: string; type: string; value: string | null; points: number; discountPercent: any; color: string; weight: number }[]): { id: string; label: string; type: string; value: string | null; points: number; discountPercent: any; color: string; weight: number } {
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0)
  let random = Math.random() * totalWeight
  for (const prize of prizes) {
    random -= prize.weight
    if (random <= 0) return prize
  }
  return prizes[prizes.length - 1]
}
