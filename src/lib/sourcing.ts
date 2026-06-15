import { prisma } from '@/lib/db'

export interface SourcingResearchEntry {
  productName: string
  category?: string
  estimatedPrice?: number
  estimatedCost?: number
  demandScore?: number
  competitionLevel?: string
  recommendedChannel?: string
  notes?: string
  assignedTo?: string
}

export async function createSourcingResearch(data: SourcingResearchEntry) {
  return prisma.sourcingResearch.create({ data })
}

export async function getAllSourcingResearch(status?: string) {
  const where = status ? { status } : {}
  return prisma.sourcingResearch.findMany({ where, orderBy: { createdAt: 'desc' } })
}

export async function updateSourcingResearchStatus(id: string, status: string) {
  return prisma.sourcingResearch.update({ where: { id }, data: { status } })
}

export async function createProductRequest(data: {
  customerId?: string
  productName: string
  description?: string
  referenceImageUrl?: string
  budgetMin?: number
  budgetMax?: number
  quantity?: number
  urgency?: string
  willingToPrepay?: boolean
}) {
  const count = await prisma.productRequest.count()
  const requestRef = `KVR-${String(count + 1).padStart(4, '0')}`
  return prisma.productRequest.create({
    data: { ...data, requestRef, status: 'pending', aiSearchResult: {} }
  })
}

export async function getProductRequests(status?: string) {
  const where = status ? { status } : {}
  return prisma.productRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { vendorOffers: true, requestUpdates: true }
  })
}

export async function getProductRequestById(id: string) {
  return prisma.productRequest.findUnique({
    where: { id },
    include: { vendorOffers: true, requestUpdates: { orderBy: { sentAt: 'desc' } } }
  })
}

export async function submitVendorOffer(data: {
  requestId: string
  vendorId: string
  price: number
  currency?: string
  deliveryDays?: number
  description?: string
  images?: string[]
}) {
  return prisma.requestVendorOffer.create({ data })
}

export async function addRequestUpdate(requestId: string, updateType: string, message: string) {
  return prisma.requestUpdate.create({ data: { requestId, updateType, message, sentAt: new Date() } })
}

export async function createSourcingAiReport(data: {
  trendingProducts?: any[]
  decliningProducts?: any[]
  recommendations?: any[]
  summary?: string
}) {
  return prisma.sourcingAiReport.create({
    data: { ...data, reportDate: new Date(), status: 'generated' }
  })
}

export async function getLatestAiReport() {
  return prisma.sourcingAiReport.findFirst({
    orderBy: { createdAt: 'desc' }
  })
}

// Landed cost calculator
export function calculateLandedCost(params: {
  supplierPrice: number
  shippingCost: number
  importDutyPercent: number
  handlingFee: number
  targetMarginPercent: number
}) {
  const { supplierPrice, shippingCost, importDutyPercent, handlingFee, targetMarginPercent } = params
  const importDuty = supplierPrice * (importDutyPercent / 100)
  const totalLandedCost = supplierPrice + shippingCost + importDuty + handlingFee
  const recommendedRetailPrice = totalLandedCost / (1 - targetMarginPercent / 100)
  const actualMarginPercent = ((recommendedRetailPrice - totalLandedCost) / recommendedRetailPrice) * 100
  return {
    totalLandedCost,
    recommendedRetailPrice,
    actualMarginPercent,
    isAboveMinimum: actualMarginPercent >= targetMarginPercent
  }
}
