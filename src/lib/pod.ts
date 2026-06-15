import { prisma } from '@/lib/db'

export async function createPodDesign(data: {
  vendorId: string
  name: string
  description?: string
  designUrl?: string
  thumbnailUrl?: string
  tags?: string[]
  category?: string
  artworkData?: any
}) {
  return prisma.podDesign.create({ data })
}

export async function getVendorPodDesigns(vendorId: string) {
  return prisma.podDesign.findMany({
    where: { vendorId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true, licenses: true } } }
  })
}

export async function getPodDesignById(id: string) {
  return prisma.podDesign.findUnique({
    where: { id },
    include: { products: true, licenses: { include: { design: false } } }
  })
}

export async function createPodProduct(data: {
  vendorId: string
  designId?: string
  productType: string
  fulfillmentPartner?: string
  variants?: any[]
  retailPrice: number
  baseCost: number
}) {
  const vendorProfit = data.retailPrice - data.baseCost
  return prisma.podProduct.create({
    data: { ...data, vendorProfit, status: 'active' }
  })
}

export async function getVendorPodProducts(vendorId: string) {
  return prisma.podProduct.findMany({
    where: { vendorId },
    orderBy: { createdAt: 'desc' },
    include: { design: true }
  })
}

export async function getMarketplaceDesigns(category?: string) {
  const where: any = { isMarketplace: true, status: 'active' }
  if (category) where.category = category
  return prisma.podDesign.findMany({
    where,
    orderBy: { licenseCount: 'desc' },
    include: { _count: { select: { licenses: true } } }
  })
}

export async function purchaseDesignLicense(designId: string, buyerVendorId: string) {
  const design = await prisma.podDesign.findUnique({ where: { id: designId } })
  if (!design || !design.licensePrice) throw new Error('Design not available')
  const price = Number(design.licensePrice)
  const kauvexCommission = price * 0.2
  const designerEarning = price - kauvexCommission
  const license = await prisma.designLicense.create({
    data: {
      designId,
      buyerVendorId,
      pricePaid: design.licensePrice,
      designerEarning,
      kauvexCommission
    }
  })
  await prisma.podDesign.update({
    where: { id: designId },
    data: { licenseCount: { increment: 1 } }
  })
  return license
}

export async function createPodOrder(data: {
  orderId: string
  podProductId: string
  fulfillmentPartner: string
}) {
  return prisma.podOrder.create({
    data: { ...data, status: 'pending', submittedAt: new Date() }
  })
}

export async function updatePodOrderStatus(id: string, status: string, trackingNumber?: string) {
  const data: any = { status }
  if (trackingNumber) data.trackingNumber = trackingNumber
  if (status === 'shipped') data.shippedAt = new Date()
  return prisma.podOrder.update({ where: { id }, data })
}

export async function getVendorPodAnalytics(vendorId: string) {
  const products = await prisma.podProduct.findMany({
    where: { vendorId },
    include: { orders: true, design: true }
  })
  const totalOrders = products.reduce((sum, p) => sum + p.orders.length, 0)
  const totalRevenue = products.reduce((sum, p) => sum + Number(p.retailPrice || 0) * p.orders.length, 0)
  const totalProfit = products.reduce((sum, p) => sum + Number(p.vendorProfit || 0) * p.orders.length, 0)
  return { totalProducts: products.length, totalOrders, totalRevenue, totalProfit }
}
