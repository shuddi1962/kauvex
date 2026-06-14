import prisma from '@/lib/db'

export interface SplitDetails {
  orderTotal: number
  vendorAmount: number
  commissionRate: number
  commission: number
  toVendor: number
  shippingFee: number
}

export interface SplitSummary {
  orderId: string
  transactions: Array<{
    id: string
    type: string
    amount: number
    status: string
    description: string | null
    createdAt: Date
  }>
  totalCommission: number
  totalPayout: number
  totalShipping: number
}

export function calculateSplit(
  orderTotal: number,
  vendorAmount: number,
  commissionRate: number,
  shippingFee: number
): SplitDetails {
  const commission = Math.round((vendorAmount * commissionRate / 100) * 100) / 100
  const toVendor = Math.round((vendorAmount - commission) * 100) / 100

  return {
    orderTotal,
    vendorAmount,
    commissionRate,
    commission,
    toVendor,
    shippingFee,
  }
}

export async function processSplitPayment(
  orderId: string,
  vendorId: string,
  splitDetails: SplitDetails
): Promise<void> {
  try {
    await prisma.paymentTransaction.create({
      data: {
        orderId,
        amount: splitDetails.commission,
        currency: 'USD',
        gateway: 'split',
        type: 'commission',
        status: 'completed',
        description: `Kauvex commission for order ${orderId}`,
        metadata: { splitType: 'commission', orderId },
      },
    })

    await prisma.paymentTransaction.create({
      data: {
        orderId,
        vendorId,
        amount: splitDetails.toVendor,
        currency: 'USD',
        gateway: 'split',
        type: 'payout',
        status: 'pending',
        description: `Vendor payout for order ${orderId}`,
        metadata: { splitType: 'vendor_payout', orderId },
      },
    })

    if (splitDetails.shippingFee > 0) {
      await prisma.paymentTransaction.create({
        data: {
          orderId,
          amount: splitDetails.shippingFee,
          currency: 'USD',
          gateway: 'split',
          type: 'shipping_fee',
          status: 'completed',
          description: `Shipping fee for order ${orderId}`,
          metadata: { splitType: 'shipping', orderId },
        },
      })
    }

    const profile = await prisma.profile.findFirst({ where: { vendorId } })
    const currentBalance = Number(profile?.walletBalance ?? 0)
    const newBalance = currentBalance + splitDetails.toVendor

    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { walletBalance: newBalance },
      })
    }

    await prisma.vendorWalletTransaction.create({
      data: {
        vendorId,
        type: 'credit',
        amount: splitDetails.toVendor,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceType: 'order',
        referenceId: orderId,
        description: `Payout for order ${orderId}`,
      },
    })
  } catch (error) {
    throw new Error(`Failed to process split payment: ${(error as Error).message}`)
  }
}

export async function getSplitSummary(orderId: string): Promise<SplitSummary> {
  try {
    const transactions = await prisma.paymentTransaction.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    })

    return {
      orderId,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        status: t.status,
        description: t.description,
        createdAt: t.createdAt,
      })),
      totalCommission: transactions
        .filter(t => t.type === 'commission')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalPayout: transactions
        .filter(t => t.type === 'payout')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalShipping: transactions
        .filter(t => t.type === 'shipping_fee')
        .reduce((sum, t) => sum + Number(t.amount), 0),
    }
  } catch (error) {
    throw new Error(`Failed to get split summary: ${(error as Error).message}`)
  }
}
