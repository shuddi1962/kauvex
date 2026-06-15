import { prisma } from '@/lib/db'

export async function createArtListing(data: {
  creatorId: string
  title: string
  description?: string
  category?: string
  tags?: string[]
  previewUrl?: string
  fileUrl?: string
  fileType?: string
  isLimitedEdition?: boolean
  editionSize?: number
}) {
  return prisma.artListing.create({
    data: {
      ...data,
      mode: 'A',
      status: 'active',
      editionSold: 0,
    }
  })
}

export async function getArtListings(category?: string) {
  const where: any = { status: 'active' }
  if (category) where.category = category
  return prisma.artListing.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { licenses: true, _count: { select: { purchases: true } } }
  })
}

export async function getArtListingById(id: string) {
  return prisma.artListing.findUnique({
    where: { id },
    include: { licenses: true, purchases: { orderBy: { createdAt: 'desc' }, take: 10 } }
  })
}

export async function addArtLicense(listingId: string, data: {
  licenseType: string
  price: number
  currency?: string
}) {
  return prisma.artLicense.create({
    data: { listingId, ...data }
  })
}

export async function purchaseArt(data: {
  listingId: string
  licenseId: string
  buyerId: string
  orderId?: string
  pricePaid: number
}) {
  const listing = await prisma.artListing.findUnique({ where: { id: data.listingId } })
  if (!listing) throw new Error('Listing not found')

  const kauvexCommission = data.pricePaid * 0.2
  const creatorEarning = data.pricePaid - kauvexCommission

  const purchase = await prisma.artPurchase.create({
    data: {
      listingId: data.listingId,
      licenseId: data.licenseId,
      buyerId: data.buyerId,
      orderId: data.orderId,
      pricePaid: data.pricePaid,
      creatorEarning,
      kauvexCommission,
      downloadUrl: listing.fileUrl,
    }
  })

  if (listing.isLimitedEdition) {
    await prisma.artListing.update({
      where: { id: data.listingId },
      data: { editionSold: { increment: 1 } }
    })
  }

  return purchase
}

export async function getCreatorArtListings(creatorId: string) {
  return prisma.artListing.findMany({
    where: { creatorId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { purchases: true } } }
  })
}

export async function getCreatorEarnings(creatorId: string) {
  const purchases = await prisma.artPurchase.findMany({
    where: { listing: { creatorId } },
    select: { creatorEarning: true, pricePaid: true, createdAt: true }
  })
  const totalEarnings = purchases.reduce((sum, p) => sum + Number(p.creatorEarning || 0), 0)
  const totalSales = purchases.reduce((sum, p) => sum + Number(p.pricePaid || 0), 0)
  return { totalEarnings, totalSales, saleCount: purchases.length }
}
