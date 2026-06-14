import prisma from '@/lib/db'

export interface WalletTransactionInput {
  vendorId?: string
  customerId?: string
  amount: number
  type: string
  referenceType: string
  referenceId: string
  description: string
}

export interface WalletTransactionResult {
  id: string
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  referenceType: string | null
  referenceId: string | null
  description: string | null
  status: string
  createdAt: Date
}

export async function creditVendorWallet(
  vendorId: string,
  amount: number,
  type: string,
  refType: string,
  refId: string,
  description: string
): Promise<WalletTransactionResult> {
  try {
    const profile = await prisma.profile.findFirst({ where: { vendorId } })
    const currentBalance = Number(profile?.walletBalance ?? 0)
    const newBalance = currentBalance + amount

    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { walletBalance: newBalance },
      })
    }

    const txn = await prisma.vendorWalletTransaction.create({
      data: {
        vendorId,
        type,
        amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceType: refType,
        referenceId: refId,
        description,
      },
    })

    return {
      id: txn.id,
      type: txn.type,
      amount: Number(txn.amount),
      balanceBefore: Number(txn.balanceBefore),
      balanceAfter: Number(txn.balanceAfter),
      referenceType: txn.referenceType,
      referenceId: txn.referenceId,
      description: txn.description,
      status: txn.status,
      createdAt: txn.createdAt,
    }
  } catch (error) {
    throw new Error(`Failed to credit vendor wallet: ${(error as Error).message}`)
  }
}

export async function debitVendorWallet(
  vendorId: string,
  amount: number,
  type: string,
  refType: string,
  refId: string,
  description: string
): Promise<WalletTransactionResult> {
  try {
    const profile = await prisma.profile.findFirst({ where: { vendorId } })
    const currentBalance = Number(profile?.walletBalance ?? 0)
    const newBalance = currentBalance - amount

    if (newBalance < 0) throw new Error('Insufficient wallet balance')

    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { walletBalance: newBalance },
      })
    }

    const txn = await prisma.vendorWalletTransaction.create({
      data: {
        vendorId,
        type,
        amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceType: refType,
        referenceId: refId,
        description,
      },
    })

    return {
      id: txn.id,
      type: txn.type,
      amount: Number(txn.amount),
      balanceBefore: Number(txn.balanceBefore),
      balanceAfter: Number(txn.balanceAfter),
      referenceType: txn.referenceType,
      referenceId: txn.referenceId,
      description: txn.description,
      status: txn.status,
      createdAt: txn.createdAt,
    }
  } catch (error) {
    throw new Error(`Failed to debit vendor wallet: ${(error as Error).message}`)
  }
}

export async function getVendorBalance(vendorId: string): Promise<number> {
  try {
    const profile = await prisma.profile.findFirst({ where: { vendorId } })
    return Number(profile?.walletBalance ?? 0)
  } catch (error) {
    throw new Error(`Failed to get vendor balance: ${(error as Error).message}`)
  }
}

export async function getVendorTransactions(
  vendorId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ transactions: WalletTransactionResult[]; total: number }> {
  try {
    const [transactions, total] = await Promise.all([
      prisma.vendorWalletTransaction.findMany({
        where: { vendorId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.vendorWalletTransaction.count({ where: { vendorId } }),
    ])

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        balanceBefore: Number(t.balanceBefore),
        balanceAfter: Number(t.balanceAfter),
        referenceType: t.referenceType,
        referenceId: t.referenceId,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
      })),
      total,
    }
  } catch (error) {
    throw new Error(`Failed to get vendor transactions: ${(error as Error).message}`)
  }
}

export async function creditCustomerWallet(
  customerId: string,
  amount: number,
  type: string,
  refType: string,
  refId: string,
  description: string
): Promise<WalletTransactionResult> {
  try {
    const profile = await prisma.profile.findFirst({ where: { id: customerId } })
    const currentBalance = Number(profile?.walletBalance ?? 0)
    const newBalance = currentBalance + amount

    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { walletBalance: newBalance },
      })
    }

    const txn = await prisma.customerWalletTransaction.create({
      data: {
        customerId,
        type,
        amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceType: refType,
        referenceId: refId,
        description,
      },
    })

    return {
      id: txn.id,
      type: txn.type,
      amount: Number(txn.amount),
      balanceBefore: Number(txn.balanceBefore),
      balanceAfter: Number(txn.balanceAfter),
      referenceType: txn.referenceType,
      referenceId: txn.referenceId,
      description: txn.description,
      status: txn.status,
      createdAt: txn.createdAt,
    }
  } catch (error) {
    throw new Error(`Failed to credit customer wallet: ${(error as Error).message}`)
  }
}

export async function debitCustomerWallet(
  customerId: string,
  amount: number,
  type: string,
  refType: string,
  refId: string,
  description: string
): Promise<WalletTransactionResult> {
  try {
    const profile = await prisma.profile.findFirst({ where: { id: customerId } })
    const currentBalance = Number(profile?.walletBalance ?? 0)
    const newBalance = currentBalance - amount

    if (newBalance < 0) throw new Error('Insufficient wallet balance')

    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { walletBalance: newBalance },
      })
    }

    const txn = await prisma.customerWalletTransaction.create({
      data: {
        customerId,
        type,
        amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceType: refType,
        referenceId: refId,
        description,
      },
    })

    return {
      id: txn.id,
      type: txn.type,
      amount: Number(txn.amount),
      balanceBefore: Number(txn.balanceBefore),
      balanceAfter: Number(txn.balanceAfter),
      referenceType: txn.referenceType,
      referenceId: txn.referenceId,
      description: txn.description,
      status: txn.status,
      createdAt: txn.createdAt,
    }
  } catch (error) {
    throw new Error(`Failed to debit customer wallet: ${(error as Error).message}`)
  }
}

export async function getCustomerBalance(customerId: string): Promise<number> {
  try {
    const profile = await prisma.profile.findFirst({ where: { id: customerId } })
    return Number(profile?.walletBalance ?? 0)
  } catch (error) {
    throw new Error(`Failed to get customer balance: ${(error as Error).message}`)
  }
}

export async function getCustomerTransactions(
  customerId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ transactions: WalletTransactionResult[]; total: number }> {
  try {
    const [transactions, total] = await Promise.all([
      prisma.customerWalletTransaction.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.customerWalletTransaction.count({ where: { customerId } }),
    ])

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        balanceBefore: Number(t.balanceBefore),
        balanceAfter: Number(t.balanceAfter),
        referenceType: t.referenceType,
        referenceId: t.referenceId,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
      })),
      total,
    }
  } catch (error) {
    throw new Error(`Failed to get customer transactions: ${(error as Error).message}`)
  }
}
