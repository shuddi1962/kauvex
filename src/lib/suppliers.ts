import { prisma } from '@/lib/db'

export interface SupplierRegistration {
  businessName: string
  contactPerson: string
  email: string
  phone?: string
  city?: string
  state?: string
  country?: string
  categories?: string[]
  deliveryMethod?: string
  minOrderValue?: number
  bankName?: string
  bankAccount?: string
  bankAccountName?: string
}

export async function registerSupplier(data: SupplierRegistration) {
  return prisma.localSupplier.create({
    data: {
      businessName: data.businessName,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      city: data.city,
      state: data.state,
      country: data.country || 'Nigeria',
      categories: data.categories || [],
      deliveryMethod: data.deliveryMethod,
      minOrderValue: data.minOrderValue || 0,
      bankName: data.bankName,
      bankAccount: data.bankAccount,
      bankAccountName: data.bankAccountName,
      status: 'pending',
      commissionRate: 8.00,
    }
  })
}

export async function getSupplierById(id: string) {
  return prisma.localSupplier.findUnique({
    where: { id },
    include: { products: true, coverage: true, orders: { take: 20, orderBy: { createdAt: 'desc' } }, payouts: { take: 10, orderBy: { createdAt: 'desc' } } }
  })
}

export async function getSupplierByEmail(email: string) {
  return prisma.localSupplier.findUnique({ where: { email } })
}

export async function getAllSuppliers(status?: string) {
  const where = status ? { status } : {}
  return prisma.localSupplier.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true, orders: true } } }
  })
}

export async function updateSupplierStatus(id: string, status: string) {
  return prisma.localSupplier.update({ where: { id }, data: { status } })
}

export async function getSupplierProducts(supplierId: string) {
  return prisma.supplierProduct.findMany({
    where: { supplierId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createSupplierProduct(data: {
  supplierId: string
  supplierSku?: string
  supplierPrice?: number
  kauvexPrice?: number
  stockQuantity?: number
  imageUrl?: string
}) {
  return prisma.supplierProduct.create({ data })
}

export async function updateSupplierProduct(id: string, data: any) {
  return prisma.supplierProduct.update({ where: { id }, data })
}

export async function updateSupplierStock(id: string, quantity: number) {
  const product = await prisma.supplierProduct.findUnique({ where: { id } })
  if (!product) throw new Error('Product not found')
  const lowStockThreshold = product.lowStockThreshold || 10
  const status = quantity === 0 ? 'out_of_stock' : quantity <= lowStockThreshold ? 'low_stock' : 'active'
  return prisma.supplierProduct.update({
    where: { id },
    data: { stockQuantity: quantity, status }
  })
}

export async function getSupplierOrders(supplierId: string, status?: string) {
  const where: any = { supplierId }
  if (status) where.status = status
  return prisma.supplierOrder.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  })
}

export async function confirmSupplierOrder(id: string) {
  return prisma.supplierOrder.update({
    where: { id },
    data: { status: 'confirmed', confirmedAt: new Date() }
  })
}

export async function shipSupplierOrder(id: string, trackingNumber: string, courierName: string) {
  return prisma.supplierOrder.update({
    where: { id },
    data: { status: 'shipped', trackingNumber, courierName, shippedAt: new Date() }
  })
}

export async function addSupplierCoverage(supplierId: string, coverage: { country: string; state?: string; city?: string }) {
  return prisma.supplierCoverage.create({
    data: { supplierId, ...coverage, isActive: true }
  })
}

export async function getSupplierCoverage(supplierId: string) {
  return prisma.supplierCoverage.findMany({ where: { supplierId, isActive: true } })
}

export async function calculateSupplierPayout(supplierId: string, periodStart: Date, periodEnd: Date) {
  const supplier = await prisma.localSupplier.findUnique({ where: { id: supplierId } })
  const commissionRate = Number(supplier?.commissionRate || 8)
  const grossAmount = 0
  const commissionAmount = grossAmount * (commissionRate / 100)
  return { grossAmount, commissionAmount, netAmount: grossAmount - commissionAmount }
}

// Escalation check: 2hr/4hr/6hr auto-escalation
export async function checkSupplierOrderEscalations() {
  const now = new Date()
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

  const pendingOrders = await prisma.supplierOrder.findMany({
    where: { status: 'pending', createdAt: { lte: twoHoursAgo } }
  })

  for (const order of pendingOrders) {
    const age = now.getTime() - order.createdAt.getTime()
    const hoursSinceCreation = age / (1000 * 60 * 60)

    if (hoursSinceCreation >= 6) {
      await prisma.supplierOrder.update({
        where: { id: order.id },
        data: { status: 'escalated', escalatedAt: now }
      })
      // TODO: Send admin alert
    }
    // TODO: Send reminder emails at 2hr and 4hr marks
  }

  return { escalated: pendingOrders.filter(o => now.getTime() - o.createdAt.getTime() >= 6 * 60 * 60 * 1000).length }
}
