import { prisma } from '@/lib/db'

export async function mintNftToken(data: {
  listingId?: string
  tokenStandard: string
  contractAddress?: string
  tokenId?: string
  blockchain?: string
  ipfsMetadataUri?: string
  ipfsMediaUri?: string
  royaltyPercent?: number
  currentOwnerWallet?: string
}) {
  return prisma.nftToken.create({
    data: {
      ...data,
      royaltyPercent: data.royaltyPercent || 0,
      mintedAt: new Date(),
    }
  })
}

export async function listNftForSale(data: {
  tokenId: string
  price: number
  currency?: string
  sellerWallet: string
  saleType?: string
}) {
  return prisma.nftSale.create({
    data: {
      tokenId: data.tokenId,
      price: data.price,
      currency: data.currency || 'MATIC',
      sellerWallet: data.sellerWallet,
      saleType: data.saleType || 'fixed',
    }
  })
}

export async function getAllNftTokens(blockchain?: string) {
  const where: any = {}
  if (blockchain) where.blockchain = blockchain
  return prisma.nftToken.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getNftTokenById(id: string) {
  const [sales, auctions] = await Promise.all([
    prisma.nftSale.findMany({ where: { tokenId: id }, orderBy: { createdAt: 'desc' } }),
    prisma.nftAuction.findMany({ where: { tokenId: id }, orderBy: { createdAt: 'desc' } })
  ])
  const token = await prisma.nftToken.findUnique({ where: { id } })
  return token ? { ...token, sales, auctions } : null
}

export async function getNftSales(tokenId: string) {
  return prisma.nftSale.findMany({
    where: { tokenId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createNftAuction(data: {
  tokenId: string
  startingPrice: number
  reservePrice?: number
  endsInHours: number
  currency?: string
}) {
  const endsAt = new Date(Date.now() + data.endsInHours * 60 * 60 * 1000)
  return prisma.nftAuction.create({
    data: {
      tokenId: data.tokenId,
      startingPrice: data.startingPrice,
      reservePrice: data.reservePrice,
      endsAt,
      status: 'active',
    }
  })
}

export async function placeBid(auctionId: string, bidderWallet: string, amount: number) {
  const auction = await prisma.nftAuction.findUnique({ where: { id: auctionId } })
  if (!auction) throw new Error('Auction not found')
  if (auction.status !== 'active') throw new Error('Auction is not active')
  if (auction.endsAt && new Date() > auction.endsAt) {
    await prisma.nftAuction.update({ where: { id: auctionId }, data: { status: 'ended' } })
    throw new Error('Auction has ended')
  }
  const currentBid = Number(auction.currentBid || auction.startingPrice || 0)
  if (amount <= currentBid) throw new Error('Bid must be higher than current bid')

  return prisma.nftAuction.update({
    where: { id: auctionId },
    data: { currentBid: amount, currentBidderWallet: bidderWallet }
  })
}

export async function registerCreatorWallet(creatorId: string, walletAddress: string, walletType?: string) {
  return prisma.creatorWallet.upsert({
    where: { creatorId },
    update: { walletAddress, walletType, verifiedAt: new Date() },
    create: { creatorId, walletAddress, walletType, verifiedAt: new Date() }
  })
}

export async function getCreatorWallet(creatorId: string) {
  return prisma.creatorWallet.findUnique({ where: { creatorId } })
}

export async function getNftAnalytics() {
  const [tokens, sales, auctions] = await Promise.all([
    prisma.nftToken.count(),
    prisma.nftSale.count(),
    prisma.nftAuction.count({ where: { status: 'active' } })
  ])
  const totalVolume = await prisma.nftSale.aggregate({
    _sum: { price: true }
  })
  return {
    totalTokens: tokens,
    totalSales: sales,
    activeAuctions: auctions,
    totalVolume: Number(totalVolume._sum.price || 0),
  }
}
