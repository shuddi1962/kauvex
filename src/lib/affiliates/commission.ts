import { insforge } from '@/lib/insforge'

export const DEFAULT_COMMISSION_RATES: Record<string, number> = {
  electronics: 4,
  fashion: 8,
  home_living: 6,
  health_beauty: 10,
  sports_outdoors: 7,
  automotive: 5,
  food_grocery: 3,
  digital_products: 15,
  pod_products: 12,
  art_marketplace: 15,
}

export const INFLUENCER_RATE_BOOST: Record<string, number> = {
  standard: 3,
  verified: 4,
  top: 5,
  celebrity: 0,
}

export const BOUNTY_AMOUNTS: Record<string, number> = {
  new_customer: 500,
  vendor_signup: 5000,
  fbk_enrollment: 3000,
  express_business: 2000,
  wallet_activation: 200,
  app_install: 100,
}

export interface CommissionItem {
  productId: string
  categoryId?: string
  saleAmount: number
  baseRate: number
  bonusRate: number
  commissionAmount: number
}

export interface CommissionResult {
  items: CommissionItem[]
  totalCommission: number
  bonusApplied: boolean
  flags: string[]
}

export function getEffectiveRate(
  categorySlug: string,
  partnerType: string,
  influencerTier?: string
): number {
  let base = DEFAULT_COMMISSION_RATES[categorySlug]

  if (base === undefined) {
    base = partnerType === 'influencer' ? 10 : 5
  }

  if (influencerTier && INFLUENCER_RATE_BOOST[influencerTier] !== undefined) {
    base += INFLUENCER_RATE_BOOST[influencerTier]
  }

  return base
}

export function calculateCommission(
  orderItems: Array<{ productId: string; categorySlug: string; price: number }>,
  partnerType: string,
  influencerTier?: string,
  activePromotions?: Array<{ categoryIds?: string[]; bonusRate: number }>
): CommissionResult {
  const items: CommissionItem[] = []
  let totalCommission = 0
  let bonusApplied = false
  const flags: string[] = []

  for (const item of orderItems) {
    const baseRate = getEffectiveRate(item.categorySlug, partnerType, influencerTier)
    let bonusRate = 0

    if (activePromotions) {
      for (const promo of activePromotions) {
        if (!promo.categoryIds || promo.categoryIds.length === 0 || promo.categoryIds.includes(item.categorySlug)) {
          bonusRate = Math.max(bonusRate, promo.bonusRate)
        }
      }
    }

    const effectiveRate = baseRate + bonusRate
    const commissionAmount = (item.price * effectiveRate) / 100

    if (bonusRate > 0) bonusApplied = true

    if (influencerTier === 'celebrity') {
      flags.push('custom_negotiated_rate')
    }

    items.push({
      productId: item.productId,
      saleAmount: item.price,
      baseRate,
      bonusRate,
      commissionAmount: Math.round(commissionAmount * 100) / 100,
    })

    totalCommission += commissionAmount
  }

  totalCommission = Math.round(totalCommission * 100) / 100

  return { items, totalCommission, bonusApplied, flags }
}
