import prisma from '@/lib/db'

export interface PriceRecommendation {
  productId: string
  currentPrice: number
  recommendedPrice: number
  minPrice: number
  maxPrice: number
  confidence: number
  reasoning: string[]
  factors: PricingFactors
}

export interface PricingFactors {
  demandScore: number
  competitorAvgPrice: number | null
  inventoryRatio: number
  timeAdjustment: number
  seasonalityMultiplier: number
}

const DEMAND_WINDOW_HOURS = 48
const COMPETITOR_WINDOW_DAYS = 7
const LOW_STOCK_RATIO = 0.2
const HIGH_DEMAND_THRESHOLD = 50

export async function calculateOptimalPrice(
  productId: string,
  basePrice: number
): Promise<PriceRecommendation> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      regularPrice: true,
      salePrice: true,
      vendorId: true,
    },
  })
  if (!product) throw new Error(`Product ${productId} not found`)
  if (!basePrice || basePrice <= 0) basePrice = Number(product.regularPrice)

  const [recentViews, recentCarts, inventory, competitorOffers] = await Promise.all([
    prisma.analyticsEvent.count({
      where: {
        productId,
        eventType: 'product_view',
        createdAt: { gte: new Date(Date.now() - DEMAND_WINDOW_HOURS * 60 * 60 * 1000) },
      },
    }),
    prisma.analyticsEvent.count({
      where: {
        productId,
        eventType: 'add_to_cart',
        createdAt: { gte: new Date(Date.now() - DEMAND_WINDOW_HOURS * 60 * 60 * 1000) },
      },
    }),
    prisma.warehouseInventory.aggregate({
      where: { productId },
      _sum: { quantityAvailable: true },
    }),
    prisma.vendorOffer.findMany({
      where: {
        sharedProduct: { masterProductId: productId },
        isActive: true,
        vendorId: product.vendorId ? { not: product.vendorId } : undefined,
      },
      select: { price: true },
    }),
  ])

  const totalDemand = recentViews + recentCarts * 3
  const demandScore = Math.min(totalDemand / HIGH_DEMAND_THRESHOLD, 2)

  let competitorAvgPrice: number | null = null
  if (competitorOffers.length > 0) {
    competitorAvgPrice =
      competitorOffers.reduce((sum, o) => sum + Number(o.price), 0) / competitorOffers.length
  }

  const totalAvailable = Number(inventory._sum.quantityAvailable ?? 0)
  const inventoryRatio = totalAvailable > 0
    ? Math.min(totalAvailable / 100, 2)
    : 0

  const now = new Date()
  const hour = now.getHours()
  const isPeakHour = hour >= 10 && hour <= 14 || hour >= 18 && hour <= 22
  const timeAdjustment = isPeakHour ? 1.1 : 0.95

  const month = now.getMonth()
  const isHolidaySeason = month >= 10 || month <= 1
  const seasonalityMultiplier = isHolidaySeason ? 1.15 : 1.0

  let price = basePrice
  const reasoning: string[] = []

  if (demandScore > 1.5) {
    price *= 1 + (demandScore - 1.5) * 0.1
    reasoning.push(`High demand (${totalDemand} interactions in ${DEMAND_WINDOW_HOURS}h)`)
  } else if (demandScore < 0.3) {
    price *= 0.95
    reasoning.push(`Low demand (${totalDemand} interactions)`)
  }

  if (competitorAvgPrice !== null && competitorAvgPrice > 0) {
    const ratio = basePrice / competitorAvgPrice
    if (ratio > 1.2) {
      price *= 0.95
      reasoning.push(`Competitors pricing lower (avg $${competitorAvgPrice.toFixed(2)})`)
    } else if (ratio < 0.8) {
      price *= 1.05
      reasoning.push(`Price below market average ($${competitorAvgPrice.toFixed(2)})`)
    }
  }

  if (totalAvailable > 0 && totalAvailable < 10) {
    price *= 1.1
    reasoning.push(`Low stock (${totalAvailable} units remaining)`)
  } else if (totalAvailable > 200) {
    price *= 0.92
    reasoning.push(`Excess inventory (${totalAvailable} units)`)
  }

  if (isPeakHour) {
    price *= 1.05
    reasoning.push('Peak hour pricing adjustment')
  }

  if (isHolidaySeason) {
    price *= 1.08
    reasoning.push('Holiday season multiplier')
  }

  const maxPrice = basePrice * 1.5
  const minPrice = basePrice * 0.5
  const finalPrice = Math.round(Math.min(Math.max(price, minPrice), maxPrice) * 100) / 100

  const demandRange = demandScore / 2
  const inventoryRange = inventoryRatio > 0 ? 0.3 : 0
  const confidence = Math.min(
    (0.4 + demandRange * 0.3 + inventoryRange * 0.3) * 100,
    100
  )

  return {
    productId,
    currentPrice: basePrice,
    recommendedPrice: finalPrice,
    minPrice,
    maxPrice,
    confidence: Math.round(confidence),
    reasoning,
    factors: {
      demandScore,
      competitorAvgPrice,
      inventoryRatio,
      timeAdjustment,
      seasonalityMultiplier,
    },
  }
}

export async function getPriceRecommendation(
  productId: string
): Promise<PriceRecommendation | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      regularPrice: true,
      salePrice: true,
    },
  })

  if (!product) return null

  const basePrice = Number(product.salePrice ?? product.regularPrice)
  return calculateOptimalPrice(productId, basePrice)
}
