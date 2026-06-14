import prisma from '@/lib/db'

export interface DemandForecast {
  productId: string
  productName: string
  dailyForecasts: { day: number; date: string; predictedUnits: number }[]
  totalPredictedUnits: number
  averageDailyDemand: number
  confidence: number
}

export interface ReorderRecommendation {
  productId: string
  productName: string
  sku: string
  currentStock: number
  reservedStock: number
  availableStock: number
  reorderPoint: number
  recommendedQty: number
  averageDailySales: number
  daysUntilStockout: number
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface StockMovementAnalysis {
  productId: string
  productName: string
  periodDays: number
  totalSold: number
  totalRestocked: number
  netChange: number
  dailyAverageSold: number
  trend: 'increasing' | 'decreasing' | 'stable'
  velocity: 'fast' | 'normal' | 'slow'
}

export async function forecastDemand(
  productId: string,
  days: number = 30
): Promise<DemandForecast> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  })
  if (!product) throw new Error(`Product ${productId} not found`)

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  const recentOrders = await prisma.orderItem.findMany({
    where: {
      productId,
      order: {
        createdAt: { gte: ninetyDaysAgo },
        status: { notIn: ['cancelled', 'refunded'] },
      },
    },
    select: {
      quantity: true,
      order: { select: { createdAt: true } },
    },
  })

  const dailySalesMap = new Map<string, number>()
  for (const item of recentOrders) {
    const dateStr = new Date(item.order.createdAt).toISOString().split('T')[0]
    dailySalesMap.set(dateStr, (dailySalesMap.get(dateStr) || 0) + item.quantity)
  }

  const sortedDates = Array.from(dailySalesMap.keys()).sort()
  const salesValues = sortedDates.map((d) => dailySalesMap.get(d) ?? 0)

  const totalSales = salesValues.reduce((sum, v) => sum + v, 0)
  const averageDailyDemand = sortedDates.length > 0 ? totalSales / sortedDates.length : 1

  let trendFactor = 1
  if (salesValues.length >= 14) {
    const recent14 = salesValues.slice(-14)
    const older14 = salesValues.slice(0, 14)
    const recentAvg = recent14.reduce((s, v) => s + v, 0) / recent14.length
    const olderAvg = older14.reduce((s, v) => s + v, 0) / older14.length
    if (recentAvg > olderAvg * 1.2) trendFactor = 1.15
    else if (recentAvg < olderAvg * 0.8) trendFactor = 0.85
  }

  const today = new Date()
  const dailyForecasts: { day: number; date: string; predictedUnits: number }[] = []
  let totalPredictedUnits = 0

  for (let i = 1; i <= days; i++) {
    const forecastDate = new Date(today)
    forecastDate.setDate(today.getDate() + i)
    const dayOfWeek = forecastDate.getDay()
    const dayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.0

    const predicted = Math.round(averageDailyDemand * trendFactor * dayMultiplier * 100) / 100
    totalPredictedUnits += predicted
    dailyForecasts.push({
      day: i,
      date: forecastDate.toISOString().split('T')[0],
      predictedUnits: predicted,
    })
  }

  const dataPoints = sortedDates.length
  const confidence = Math.min(
    dataPoints >= 60 ? 0.9 : dataPoints >= 30 ? 0.7 : dataPoints >= 14 ? 0.5 : 0.3,
    1
  )

  return {
    productId,
    productName: product.name,
    dailyForecasts,
    totalPredictedUnits: Math.round(totalPredictedUnits * 100) / 100,
    averageDailyDemand: Math.round(averageDailyDemand * 100) / 100,
    confidence,
  }
}

export async function getReorderRecommendation(
  warehouseId: string
): Promise<ReorderRecommendation[]> {
  const inventoryItems = await prisma.warehouseInventory.findMany({
    where: { warehouseId },
    include: { warehouse: true },
  })

  if (inventoryItems.length === 0) return []

  const productIds = inventoryItems.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  })
  const productMap = new Map(products.map((p) => [p.id, p.name]))

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const orderItems = await prisma.orderItem.findMany({
    where: {
      productId: { in: productIds },
      order: {
        createdAt: { gte: ninetyDaysAgo },
        status: { notIn: ['cancelled', 'refunded'] },
      },
    },
    select: {
      productId: true,
      quantity: true,
    },
  })

  const salesMap = new Map<string, number>()
  for (const item of orderItems) {
    if (item.productId) salesMap.set(item.productId, (salesMap.get(item.productId) || 0) + item.quantity)
  }

  const recommendations: ReorderRecommendation[] = []

  for (const inv of inventoryItems) {
    const totalSold = salesMap.get(inv.productId) ?? 0
    const averageDailySales = totalSold / 90
    const availableStock = inv.quantityAvailable
    const reorderPoint = inv.reorderPoint

    const daysUntilStockout = averageDailySales > 0
      ? Math.floor(availableStock / averageDailySales)
      : 999

    let recommendedQty = 0
    if (availableStock <= reorderPoint) {
      recommendedQty = Math.max(inv.reorderQty, Math.ceil(averageDailySales * 30) - availableStock)
    }

    let priority: 'low' | 'medium' | 'high' | 'critical'
    if (daysUntilStockout <= 0) priority = 'critical'
    else if (daysUntilStockout <= 3) priority = 'high'
    else if (daysUntilStockout <= 7) priority = 'medium'
    else priority = 'low'

    recommendations.push({
      productId: inv.productId,
      productName: productMap.get(inv.productId) ?? 'Unknown',
      sku: inv.sku,
      currentStock: inv.quantityOnHand,
      reservedStock: inv.quantityReserved,
      availableStock,
      reorderPoint,
      recommendedQty,
      averageDailySales: Math.round(averageDailySales * 100) / 100,
      daysUntilStockout,
      priority,
    })
  }

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations
}

export async function analyzeStockMovement(productId: string): Promise<StockMovementAnalysis> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  })
  if (!product) throw new Error(`Product ${productId} not found`)

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const periodDays = 90

  const [movements, orderItems] = await Promise.all([
    prisma.inventoryMovement.findMany({
      where: {
        productId,
        createdAt: { gte: ninetyDaysAgo },
      },
      select: {
        movementType: true,
        quantity: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.findMany({
      where: {
        productId,
        order: {
          createdAt: { gte: ninetyDaysAgo },
          status: { notIn: ['cancelled', 'refunded'] },
        },
      },
      select: {
        quantity: true,
        order: { select: { createdAt: true } },
      },
    }),
  ])

  let totalSold = orderItems.reduce((sum, item) => sum + item.quantity, 0)
  let totalRestocked = 0

  for (const m of movements) {
    if (m.movementType === 'inbound' || m.movementType === 'restock') {
      totalRestocked += m.quantity
    }
    if (m.movementType === 'outbound' || m.movementType === 'sale') {
      totalSold += m.quantity
    }
  }

  const netChange = totalRestocked - totalSold
  const dailyAverageSold = totalSold / periodDays

  const midPoint = Math.floor(periodDays / 2)
  const firstHalfSales = orderItems
    .filter((i) => new Date(i.order.createdAt) < new Date(ninetyDaysAgo.getTime() + midPoint * 86400000))
    .reduce((s, i) => s + i.quantity, 0)
  const secondHalfSales = orderItems
    .filter((i) => new Date(i.order.createdAt) >= new Date(ninetyDaysAgo.getTime() + midPoint * 86400000))
    .reduce((s, i) => s + i.quantity, 0)

  let trend: 'increasing' | 'decreasing' | 'stable'
  if (secondHalfSales > firstHalfSales * 1.2) trend = 'increasing'
  else if (secondHalfSales < firstHalfSales * 0.8) trend = 'decreasing'
  else trend = 'stable'

  let velocity: 'fast' | 'normal' | 'slow'
  if (dailyAverageSold >= 5) velocity = 'fast'
  else if (dailyAverageSold >= 1) velocity = 'normal'
  else velocity = 'slow'

  return {
    productId,
    productName: product.name,
    periodDays,
    totalSold,
    totalRestocked,
    netChange,
    dailyAverageSold: Math.round(dailyAverageSold * 100) / 100,
    trend,
    velocity,
  }
}
