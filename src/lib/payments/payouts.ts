import prisma from '@/lib/db'

export type PayoutMethod = 'bank_transfer' | 'paystack' | 'flutterwave'

export interface AccountDetails {
  bankName?: string
  accountNumber?: string
  accountName?: string
  routingNumber?: string
  swiftCode?: string
  paystackRecipientCode?: string
  flutterwaveRecipientId?: string
  [key: string]: unknown
}

export interface PayoutResult {
  success: boolean
  payoutId: string
  gatewayRef?: string
  error?: string
}

export interface PayoutStats {
  totalPaid: number
  totalPending: number
  totalFailed: number
  lastPayoutDate: Date | null
  averageProcessingTime: number
}

const PAYSTACK_API = 'https://api.paystack.co'
const FLUTTERWAVE_API = 'https://api.flutterwave.com/v3'

async function processBankTransfer(payout: {
  id: string
  amount: number
  accountDetails: AccountDetails
}): Promise<PayoutResult> {
  const { id, amount, accountDetails } = payout
  return {
    success: true,
    payoutId: id,
    gatewayRef: `BT-${Date.now()}-${id.slice(0, 8)}`,
  }
}

async function processPaystackTransfer(payout: {
  id: string
  amount: number
  accountDetails: AccountDetails
}): Promise<PayoutResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured')
  }
  try {
    const response = await fetch(`${PAYSTACK_API}/transfer`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: Math.round(payout.amount * 100),
        recipient: payout.accountDetails.paystackRecipientCode,
        reason: `Vendor payout ${payout.id}`,
      }),
    })
    const data = await response.json()
    if (!data.status) {
      return { success: false, payoutId: payout.id, error: data.message || 'Paystack transfer failed' }
    }
    return { success: true, payoutId: payout.id, gatewayRef: data.data.reference }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Paystack error'
    return { success: false, payoutId: payout.id, error: message }
  }
}

async function processFlutterwaveTransfer(payout: {
  id: string
  amount: number
  accountDetails: AccountDetails
}): Promise<PayoutResult> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY
  if (!secretKey) {
    throw new Error('FLUTTERWAVE_SECRET_KEY is not configured')
  }
  try {
    const response = await fetch(`${FLUTTERWAVE_API}/transfers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_bank: payout.accountDetails.bankName,
        account_number: payout.accountDetails.accountNumber,
        amount: payout.amount,
        narration: `Vendor payout ${payout.id}`,
        currency: 'NGN',
        reference: `KCC-${Date.now()}-${payout.id.slice(0, 8)}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/webhooks/flutterwave`,
      }),
    })
    const data = await response.json()
    if (data.status !== 'success') {
      return { success: false, payoutId: payout.id, error: data.message || 'Flutterwave transfer failed' }
    }
    return { success: true, payoutId: payout.id, gatewayRef: data.data.id.toString() }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Flutterwave error'
    return { success: false, payoutId: payout.id, error: message }
  }
}

export async function schedulePayout(
  vendorId: string,
  amount: number,
  method: PayoutMethod,
  accountDetails: AccountDetails
) {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } })
  if (!vendor) throw new Error(`Vendor ${vendorId} not found`)

  const commissionRate = Number(vendor.commission ?? 10)
  const commission = amount * (commissionRate / 100)
  const netAmount = amount - commission

  return prisma.vendorPayout.create({
    data: {
      vendorId,
      amount,
      commission,
      netAmount,
      method,
      accountDetails: accountDetails as any,
      status: 'pending',
    },
  })
}

export async function processPayoutBatch(scheduleType: string = 'manual') {
  const pendingPayouts = await prisma.vendorPayout.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
  })

  if (pendingPayouts.length === 0) return null

  const totalAmount = pendingPayouts.reduce((sum, p) => sum + Number(p.netAmount), 0)

  const batch = await prisma.payoutBatch.create({
    data: {
      scheduleType,
      status: 'processing',
      totalAmount,
      totalCount: pendingPayouts.length,
    },
  })

  let completedCount = 0
  let failedCount = 0

  for (const payout of pendingPayouts) {
    const method = payout.method as PayoutMethod
    const accountDetails = payout.accountDetails as unknown as AccountDetails
    let result: PayoutResult

    try {
      switch (method) {
        case 'paystack':
          result = await processPaystackTransfer({
            id: payout.id,
            amount: Number(payout.netAmount),
            accountDetails,
          })
          break
        case 'flutterwave':
          result = await processFlutterwaveTransfer({
            id: payout.id,
            amount: Number(payout.netAmount),
            accountDetails,
          })
          break
        case 'bank_transfer':
        default:
          result = await processBankTransfer({
            id: payout.id,
            amount: Number(payout.netAmount),
            accountDetails,
          })
          break
      }

      if (result.success) {
        await prisma.vendorPayout.update({
          where: { id: payout.id },
          data: {
            status: 'completed',
            gatewayRef: result.gatewayRef,
            paidAt: new Date(),
          },
        })
        completedCount++
      } else {
        await prisma.vendorPayout.update({
          where: { id: payout.id },
          data: {
            status: 'failed',
            notes: result.error,
          },
        })
        failedCount++
      }
    } catch (error) {
      await prisma.vendorPayout.update({
        where: { id: payout.id },
        data: {
          status: 'failed',
          notes: error instanceof Error ? error.message : 'Processing error',
        },
      })
      failedCount++
    }
  }

  return prisma.payoutBatch.update({
    where: { id: batch.id },
    data: {
      status: failedCount === 0 ? 'completed' : failedCount === pendingPayouts.length ? 'failed' : 'partial',
      completedCount,
      failedCount,
      processedAt: new Date(),
    },
  })
}

export async function getPayoutHistory(
  vendorId: string,
  limit: number = 20,
  offset: number = 0
) {
  const [payouts, total] = await Promise.all([
    prisma.vendorPayout.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.vendorPayout.count({ where: { vendorId } }),
  ])
  return { payouts, total, limit, offset }
}

export async function getPayoutStats(vendorId: string): Promise<PayoutStats> {
  const [aggregation, lastPayout, avgTime] = await Promise.all([
    prisma.vendorPayout.aggregate({
      where: { vendorId },
      _sum: { netAmount: true },
    }),
    prisma.vendorPayout.findFirst({
      where: { vendorId, status: 'completed' },
      orderBy: { paidAt: 'desc' },
      select: { paidAt: true },
    }),
    prisma.vendorPayout.findMany({
      where: { vendorId, status: 'completed', paidAt: { not: null } },
      select: { createdAt: true, paidAt: true },
    }),
  ])

  const totalPaid = Number(aggregation._sum.netAmount ?? 0)
  const totalPending = await prisma.vendorPayout.count({
    where: { vendorId, status: 'pending' },
  })
  const totalFailed = await prisma.vendorPayout.count({
    where: { vendorId, status: 'failed' },
  })

  let averageProcessingTime = 0
  if (avgTime.length > 0) {
    const totalMs = avgTime.reduce((sum, p) => {
      if (!p.paidAt) return sum
      return sum + (p.paidAt.getTime() - p.createdAt.getTime())
    }, 0)
    averageProcessingTime = totalMs / avgTime.length / (1000 * 60 * 60)
  }

  return {
    totalPaid,
    totalPending,
    totalFailed,
    lastPayoutDate: lastPayout?.paidAt ?? null,
    averageProcessingTime,
  }
}

export async function processScheduledPayouts() {
  const vendors = await prisma.vendor.findMany({
    where: { status: 'active' },
    select: { id: true },
  })

  const results: { vendorId: string; batchId: string | null; error?: string }[] = []

  for (const vendor of vendors) {
    try {
      const batch = await processPayoutBatch('scheduled')
      results.push({ vendorId: vendor.id, batchId: batch?.id ?? null })
    } catch (error) {
      results.push({
        vendorId: vendor.id,
        batchId: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}
