import prisma from '@/lib/db'
import { getCategoryCommissionRate, DEFAULT_COMMISSION_RATE } from '@/lib/commission'

export type Period = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'this_year' | { start: Date; end: Date }

export interface SalesReport {
  totalRevenue: number
  netRevenue: number
  totalOrders: number
  averageOrderValue: number
  refundAmount: number
  periodStart: Date
  periodEnd: Date
}

export interface VendorReport {
  vendorId: string
  shopName: string
  totalSales: number
  totalRevenue: number
  commission: number
  netPayout: number
  productCount: number
  orderCount: number
  refundRate: number
  rating: number
}

export interface AdminDashboardReport {
  grossRevenue: number
  netRevenue: number
  vendorCount: number
  customerCount: number
  productCount: number
  conversionRate: number
  cartAbandonmentRate: number
  returnRate: number
  averageOrderValue: number
  topCategories: { name: string; revenue: number; orderCount: number }[]
  revenueByStorefront: { storefrontId: string; name: string; revenue: number }[]
}

export interface InventoryReport {
  totalSkuCount: number
  lowStockItems: number
  outOfStockItems: number
  totalInventoryValue: number
  items: { sku: string; productName: string; quantityOnHand: number; quantityAvailable: number; value: number; warehouse: string }[]
}

export interface ShippingReport {
  totalShipments: number
  onTimeDeliveryRate: number
  averageDeliveryTimeHours: number
  carrierBreakdown: { carrier: string; count: number; onTimeRate: number }[]
}

export interface TaxReport {
  totalTaxCollected: number
  byCountry: { countryCode: string; taxCollected: number; orderCount: number }[]
  byRate: { rate: number; taxCollected: number; orderCount: number }[]
}

export type ReportType = 'sales' | 'vendor' | 'admin' | 'inventory' | 'shipping' | 'tax'
export type ExportFormat = 'csv' | 'json'

function resolvePeriod(period: Period): { start: Date; end: Date } {
  const now = new Date()
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)

  if (typeof period === 'object' && 'start' in period && 'end' in period) {
    return { start: period.start, end: period.end }
  }

  switch (period) {
    case 'today': {
      const start = startOfDay(now)
      return { start, end: now }
    }
    case 'yesterday': {
      const yesterday = new Date(now.getTime() - 86400000)
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) }
    }
    case 'this_week': {
      const dayOfWeek = now.getDay()
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const monday = new Date(now.getTime() - diff * 86400000)
      return { start: startOfDay(monday), end: now }
    }
    case 'this_month': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start: monthStart, end: now }
    }
    case 'last_month': {
      const firstOfLast = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastOfLast = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      return { start: firstOfLast, end: lastOfLast }
    }
    case 'this_year': {
      const yearStart = new Date(now.getFullYear(), 0, 1)
      return { start: yearStart, end: now }
    }
    default:
      return { start: now, end: now }
  }
}

export async function getSalesReport(period: Period, storefrontId?: string): Promise<SalesReport> {
  const { start, end } = resolvePeriod(period)

  const where: Record<string, unknown> = {
    createdAt: { gte: start, lte: end },
    status: { not: 'cancelled' },
  }
  if (storefrontId) where.storefrontId = storefrontId

  const [orders, refundedOrders] = await Promise.all([
    prisma.order.findMany({
      where: where as any,
      select: { total: true, tax: true, shippingCost: true, discount: true, status: true },
    }),
    prisma.order.findMany({
      where: {
        ...where,
        status: 'refunded',
      } as any,
      select: { total: true },
    }),
  ])

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const refundAmount = refundedOrders.reduce((sum, o) => sum + Number(o.total), 0)
  const netRevenue = totalRevenue - refundAmount
  const totalOrders = orders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return {
    totalRevenue,
    netRevenue,
    totalOrders,
    averageOrderValue,
    refundAmount,
    periodStart: start,
    periodEnd: end,
  }
}

export async function getVendorReport(vendorId: string, period: Period): Promise<VendorReport> {
  const { start, end } = resolvePeriod(period)

  const [vendor, productCount, orders] = await Promise.all([
    prisma.vendor.findUnique({ where: { id: vendorId } }),
    prisma.product.count({ where: { vendorId } }),
    prisma.order.findMany({
      where: {
        vendorId,
        createdAt: { gte: start, lte: end },
        status: { not: 'cancelled' },
      } as any,
      select: { total: true, status: true },
    }),
  ])

  if (!vendor) {
    throw new Error(`Vendor not found: ${vendorId}`)
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalSales = orders.length
  const commissionRate = Number(vendor.commission ?? 10)
  const commission = totalRevenue * (commissionRate / 100)
  const netPayout = totalRevenue - commission

  const refundedCount = orders.filter((o) => o.status === 'refunded').length
  const refundRate = totalSales > 0 ? (refundedCount / totalSales) * 100 : 0

  return {
    vendorId: vendor.id,
    shopName: vendor.shopName,
    totalSales,
    totalRevenue,
    commission,
    netPayout,
    productCount,
    orderCount: totalSales,
    refundRate,
    rating: Number(vendor.rating ?? 0),
  }
}

export async function getAdminDashboardReport(): Promise<AdminDashboardReport> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    grossRevenueResult,
    vendorCount,
    customerCount,
    productCount,
    monthlyOrders,
    monthlyCarts,
    returnedOrders,
    categoryRevenue,
    storefrontRevenue,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { not: 'cancelled' } },
      _sum: { total: true },
    }),
    prisma.vendor.count({ where: { status: 'active' } }),
    prisma.profile.count({ where: { role: 'customer' } }),
    prisma.product.count({ where: { status: 'active' } }),
    prisma.order.findMany({
      where: { createdAt: { gte: monthStart } },
      select: { total: true, status: true },
    }),
    prisma.abandonedCart.count({
      where: { createdAt: { gte: monthStart } },
    }),
    prisma.order.count({
      where: { createdAt: { gte: monthStart }, status: 'refunded' },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: monthStart }, status: { not: 'cancelled' } },
      include: {
        items: {
          include: { product: { include: { category: true } } },
        },
      },
    }),
    prisma.order.groupBy({
      by: ['storefrontId'],
      where: {
        createdAt: { gte: monthStart },
        status: { not: 'cancelled' },
        storefrontId: { not: null },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
  ])

  const grossRevenue = Number(grossRevenueResult._sum.total ?? 0)
  const monthlyOrderCount = monthlyOrders.length
  const monthlyRevenue = monthlyOrders.reduce((s, o) => s + Number(o.total), 0)
  const monthlyReturnedCount = returnedOrders
  const conversionRate = 0
  const cartAbandonmentRate = 0
  const returnRate = monthlyOrderCount > 0 ? (monthlyReturnedCount / monthlyOrderCount) * 100 : 0
  const averageOrderValue = monthlyOrderCount > 0 ? monthlyRevenue / monthlyOrderCount : 0

  const categoryMap = new Map<string, { revenue: number; orderCount: number }>()
  for (const order of categoryRevenue) {
    for (const item of order.items) {
      const catName = item.product?.category?.name ?? 'Uncategorized'
      const existing = categoryMap.get(catName) ?? { revenue: 0, orderCount: 0 }
      existing.revenue += Number(item.total)
      existing.orderCount += 1
      categoryMap.set(catName, existing)
    }
  }
  const topCategories = Array.from(categoryMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const sfNames = await prisma.storefront.findMany({
    where: { id: { in: storefrontRevenue.map((s) => s.storefrontId!).filter(Boolean) } },
    select: { id: true, name: true },
  })
  const sfNameMap = new Map(sfNames.map((s) => [s.id, s.name]))
  const revenueByStorefront = storefrontRevenue.map((s) => ({
    storefrontId: s.storefrontId!,
    name: sfNameMap.get(s.storefrontId!) ?? 'Unknown',
    revenue: Number(s._sum.total ?? 0),
  }))

  return {
    grossRevenue,
    netRevenue: grossRevenue,
    vendorCount,
    customerCount,
    productCount,
    conversionRate,
    cartAbandonmentRate,
    returnRate,
    averageOrderValue,
    topCategories,
    revenueByStorefront,
  }
}

export async function getInventoryReport(warehouseId?: string): Promise<InventoryReport> {
  const where: Record<string, unknown> = {}
  if (warehouseId) where.warehouseId = warehouseId

  const inventoryItems = await prisma.warehouseInventory.findMany({
    where: where as any,
    include: {
      warehouse: { select: { name: true } },
    },
  })

  const products = await prisma.product.findMany({
    where: { id: { in: [...new Set(inventoryItems.map((i) => i.productId))] } },
    select: { id: true, name: true },
  })
  const productMap = new Map(products.map((p) => [p.id, p.name]))

  let lowStockItems = 0
  let outOfStockItems = 0
  let totalInventoryValue = 0

  const items = inventoryItems.map((inv) => {
    if (inv.quantityAvailable <= 0) outOfStockItems++
    else if (inv.quantityAvailable <= inv.reorderPoint) lowStockItems++

    const productName = productMap.get(inv.productId) ?? 'Unknown'
    const value = Number(inv.quantityOnHand) * 0

    totalInventoryValue += value

    return {
      sku: inv.sku,
      productName,
      quantityOnHand: inv.quantityOnHand,
      quantityAvailable: inv.quantityAvailable,
      value,
      warehouse: inv.warehouse.name,
    }
  })

  return {
    totalSkuCount: items.length,
    lowStockItems,
    outOfStockItems,
    totalInventoryValue,
    items,
  }
}

export async function getShippingReport(period: Period): Promise<ShippingReport> {
  const { start, end } = resolvePeriod(period)

  const shipments = await prisma.shipment.findMany({
    where: {
      createdAt: { gte: start, lte: end },
    } as any,
    include: {
      carrier: { select: { name: true } },
    },
  })

  const totalShipments = shipments.length

  const deliveredOnTime = shipments.filter((s) => {
    if (!s.estimatedDelivery || !s.deliveredAt) return false
    return s.deliveredAt <= s.estimatedDelivery
  })

  const onTimeDeliveryRate = totalShipments > 0 ? (deliveredOnTime.length / totalShipments) * 100 : 0

  const delivered = shipments.filter((s) => s.deliveredAt && s.shippedAt)
  const totalDeliveryTimeMs = delivered.reduce((sum, s) => {
    return sum + (s.deliveredAt!.getTime() - s.shippedAt!.getTime())
  }, 0)
  const averageDeliveryTimeHours = delivered.length > 0
    ? totalDeliveryTimeMs / delivered.length / (1000 * 60 * 60)
    : 0

  const carrierMap = new Map<string, { count: number; onTime: number }>()
  for (const s of shipments) {
    const carrierName = s.carrier?.name ?? 'Unknown'
    const entry = carrierMap.get(carrierName) ?? { count: 0, onTime: 0 }
    entry.count++
    if (s.deliveredAt && s.estimatedDelivery && s.deliveredAt <= s.estimatedDelivery) {
      entry.onTime++
    }
    carrierMap.set(carrierName, entry)
  }
  const carrierBreakdown = Array.from(carrierMap.entries()).map(([carrier, data]) => ({
    carrier,
    count: data.count,
    onTimeRate: data.count > 0 ? (data.onTime / data.count) * 100 : 0,
  }))

  return {
    totalShipments,
    onTimeDeliveryRate,
    averageDeliveryTimeHours: Math.round(averageDeliveryTimeHours * 100) / 100,
    carrierBreakdown,
  }
}

export async function getTaxReport(period: Period, storefrontId?: string): Promise<TaxReport> {
  const { start, end } = resolvePeriod(period)

  const where: Record<string, unknown> = {
    createdAt: { gte: start, lte: end },
    status: { not: 'cancelled' },
  }
  if (storefrontId) where.storefrontId = storefrontId

  const orders = await prisma.order.findMany({
    where: where as any,
    select: { id: true, tax: true, storefrontId: true },
  })

  const totalTaxCollected = orders.reduce((sum, o) => sum + Number(o.tax ?? 0), 0)

  const storefrontIds = [...new Set(orders.map((o) => o.storefrontId).filter(Boolean) as string[])]
  const storefronts = storefrontIds.length > 0
    ? await prisma.storefront.findMany({
        where: { id: { in: storefrontIds } },
        select: { id: true, countryCode: true, taxRate: true },
      })
    : []
  const sfMap = new Map(storefronts.map((s) => [s.id, s]))

  const countryMap = new Map<string, { taxCollected: number; orderCount: number }>()
  const rateMap = new Map<number, { taxCollected: number; orderCount: number }>()

  for (const order of orders) {
    const sf = order.storefrontId ? sfMap.get(order.storefrontId) : undefined
    const countryCode = sf?.countryCode ?? 'Unknown'
    const taxAmount = Number(order.tax ?? 0)
    const rate = sf ? Number(sf.taxRate) : 0

    const countryEntry = countryMap.get(countryCode) ?? { taxCollected: 0, orderCount: 0 }
    countryEntry.taxCollected += taxAmount
    countryEntry.orderCount++
    countryMap.set(countryCode, countryEntry)

    const rateEntry = rateMap.get(rate) ?? { taxCollected: 0, orderCount: 0 }
    rateEntry.taxCollected += taxAmount
    rateEntry.orderCount++
    rateMap.set(rate, rateEntry)
  }

  return {
    totalTaxCollected,
    byCountry: Array.from(countryMap.entries()).map(([countryCode, data]) => ({ countryCode, ...data })),
    byRate: Array.from(rateMap.entries()).map(([rate, data]) => ({ rate, ...data })),
  }
}

function toCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ''
  const headers = Object.keys(data[0])
  const lines: string[] = [headers.join(',')]
  for (const row of data) {
    lines.push(
      headers
        .map((h) => {
          const val = row[h]
          if (val === null || val === undefined) return ''
          const str = String(val)
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        })
        .join(','),
    )
  }
  return lines.join('\n')
}

export async function exportReport(
  reportType: ReportType,
  format: ExportFormat,
  filters: { period?: Period; vendorId?: string; storefrontId?: string; warehouseId?: string },
): Promise<string> {
  let data: Record<string, unknown>[]

  switch (reportType) {
    case 'sales': {
      const report = await getSalesReport(filters.period ?? 'this_month', filters.storefrontId)
      data = [report as unknown as Record<string, unknown>]
      break
    }
    case 'vendor': {
      if (!filters.vendorId) throw new Error('vendorId is required for vendor report')
      const report = await getVendorReport(filters.vendorId, filters.period ?? 'this_month')
      data = [report as unknown as Record<string, unknown>]
      break
    }
    case 'admin': {
      const report = await getAdminDashboardReport()
      data = [report as unknown as Record<string, unknown>]
      break
    }
    case 'inventory': {
      const report = await getInventoryReport(filters.warehouseId)
      data = report.items as unknown as Record<string, unknown>[]
      break
    }
    case 'shipping': {
      const report = await getShippingReport(filters.period ?? 'this_month')
      data = [report as unknown as Record<string, unknown>]
      break
    }
    case 'tax': {
      const report = await getTaxReport(filters.period ?? 'this_month', filters.storefrontId)
      data = [report as unknown as Record<string, unknown>]
      break
    }
    default:
      throw new Error(`Unknown report type: ${reportType}`)
  }

  if (format === 'json') {
    return JSON.stringify(data, null, 2)
  }

  return toCsv(data)
}
