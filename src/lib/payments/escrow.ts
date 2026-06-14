import prisma from '@/lib/db'

export interface EscrowResult {
  id: string
  orderId: string
  vendorId: string
  customerId: string
  amount: number
  currency: string
  status: string
  heldAt: Date
  releasedAt: Date | null
  refundedAt: Date | null
  releaseRule: string
}

export async function holdPayment(
  orderId: string,
  vendorId: string,
  customerId: string,
  amount: number,
  currency: string = 'USD'
): Promise<EscrowResult> {
  try {
    const escrow = await prisma.escrow.create({
      data: {
        orderId,
        vendorId,
        customerId,
        amount,
        currency,
        status: 'held',
        releaseRule: 'delivery_confirmed',
        daysToRelease: 7,
      },
    })

    return {
      id: escrow.id,
      orderId: escrow.orderId,
      vendorId: escrow.vendorId,
      customerId: escrow.customerId,
      amount: Number(escrow.amount),
      currency: escrow.currency,
      status: escrow.status,
      heldAt: escrow.heldAt,
      releasedAt: escrow.releasedAt,
      refundedAt: escrow.refundedAt,
      releaseRule: escrow.releaseRule,
    }
  } catch (error) {
    throw new Error(`Failed to hold payment: ${(error as Error).message}`)
  }
}

export async function releasePayment(escrowId: string): Promise<EscrowResult> {
  try {
    const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } })
    if (!escrow) throw new Error('Escrow not found')
    if (escrow.status !== 'held') throw new Error('Escrow is not in held status')

    if (escrow.releaseRule === 'delivery_confirmed') {
      const order = await prisma.order.findUnique({ where: { id: escrow.orderId } })
      if (!order || order.status !== 'delivered') {
        throw new Error('Order has not been delivered yet')
      }
    }

    if (escrow.releaseRule === 'days_after_held' && escrow.daysToRelease) {
      const daysSinceHeld = Math.floor(
        (Date.now() - new Date(escrow.heldAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceHeld < escrow.daysToRelease) {
        throw new Error('Release period has not elapsed yet')
      }
    }

    const released = await prisma.escrow.update({
      where: { id: escrowId },
      data: { status: 'released', releasedAt: new Date() },
    })

    const profile = await prisma.profile.findFirst({ where: { vendorId: escrow.vendorId } })
    const currentBalance = Number(profile?.walletBalance ?? 0)
    const newBalance = currentBalance + Number(escrow.amount)

    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { walletBalance: newBalance },
      })
    }

    await prisma.vendorWalletTransaction.create({
      data: {
        vendorId: escrow.vendorId,
        type: 'escrow_release',
        amount: escrow.amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceType: 'escrow',
        referenceId: escrowId,
        description: `Escrow release for order ${escrow.orderId}`,
      },
    })

    return {
      id: released.id,
      orderId: released.orderId,
      vendorId: released.vendorId,
      customerId: released.customerId,
      amount: Number(released.amount),
      currency: released.currency,
      status: released.status,
      heldAt: released.heldAt,
      releasedAt: released.releasedAt,
      refundedAt: released.refundedAt,
      releaseRule: released.releaseRule,
    }
  } catch (error) {
    throw new Error(`Failed to release payment: ${(error as Error).message}`)
  }
}

export async function refundFromEscrow(escrowId: string): Promise<EscrowResult> {
  try {
    const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } })
    if (!escrow) throw new Error('Escrow not found')
    if (escrow.status !== 'held') throw new Error('Escrow is not in held status')

    const refunded = await prisma.escrow.update({
      where: { id: escrowId },
      data: { status: 'refunded', refundedAt: new Date() },
    })

    return {
      id: refunded.id,
      orderId: refunded.orderId,
      vendorId: refunded.vendorId,
      customerId: refunded.customerId,
      amount: Number(refunded.amount),
      currency: refunded.currency,
      status: refunded.status,
      heldAt: refunded.heldAt,
      releasedAt: refunded.releasedAt,
      refundedAt: refunded.refundedAt,
      releaseRule: refunded.releaseRule,
    }
  } catch (error) {
    throw new Error(`Failed to refund from escrow: ${(error as Error).message}`)
  }
}

export async function getEscrowStatus(orderId: string): Promise<EscrowResult[]> {
  try {
    const escrows = await prisma.escrow.findMany({
      where: { orderId },
      orderBy: { heldAt: 'desc' },
    })

    return escrows.map(e => ({
      id: e.id,
      orderId: e.orderId,
      vendorId: e.vendorId,
      customerId: e.customerId,
      amount: Number(e.amount),
      currency: e.currency,
      status: e.status,
      heldAt: e.heldAt,
      releasedAt: e.releasedAt,
      refundedAt: e.refundedAt,
      releaseRule: e.releaseRule,
    }))
  } catch (error) {
    throw new Error(`Failed to get escrow status: ${(error as Error).message}`)
  }
}

export async function autoReleaseEscrow(): Promise<{ released: number; skipped: number; failed: number }> {
  try {
    const heldEscrows = await prisma.escrow.findMany({
      where: { status: 'held' },
    })

    const results = { released: 0, skipped: 0, failed: 0 }

    for (const escrow of heldEscrows) {
      try {
        let canRelease = false

        if (escrow.releaseRule === 'delivery_confirmed') {
          const order = await prisma.order.findUnique({ where: { id: escrow.orderId } })
          canRelease = order?.status === 'delivered'
        }

        if (escrow.releaseRule === 'days_after_held' && escrow.daysToRelease) {
          const daysSinceHeld = Math.floor(
            (Date.now() - new Date(escrow.heldAt).getTime()) / (1000 * 60 * 60 * 24)
          )
          if (daysSinceHeld >= escrow.daysToRelease) {
            const order = await prisma.order.findUnique({ where: { id: escrow.orderId } })
            const returnPeriodDays = 14
            const returnPeriodPassed = order?.updatedAt
              ? (Date.now() - new Date(order.updatedAt).getTime()) / (1000 * 60 * 60 * 24) >= returnPeriodDays
              : true
            canRelease = returnPeriodPassed
          }
        }

        if (canRelease) {
          await releasePayment(escrow.id)
          results.released++
        } else {
          results.skipped++
        }
      } catch {
        results.failed++
      }
    }

    return results
  } catch (error) {
    throw new Error(`Failed to auto-release escrows: ${(error as Error).message}`)
  }
}
