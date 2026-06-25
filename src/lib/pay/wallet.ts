import prisma from "@/lib/db";

// ============================================================
// KAUVEX PAY WALLET — Core Operations
// ============================================================

export interface WalletInfo {
  id: string;
  ownerId: string;
  ownerType: string;
  balance: number;
  pendingBalance: number;
  reservedBalance: number;
  availableBalance: number;
  currency: string;
  status: string;
  dailySpendLimit: number;
  dailyWithdrawalLimit: number;
  singleTransactionLimit: number;
  hasPin: boolean;
  lastActivity: Date | null;
}

export interface WalletTransaction {
  id: string;
  transactionType: string;
  amount: number;
  direction: string;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  gateway: string | null;
  gatewayReference: string | null;
  status: string;
  flagged: boolean;
  createdAt: Date;
}

export interface CreateWalletInput {
  ownerId: string;
  ownerType: "customer" | "vendor" | "logistics_partner" | "affiliate";
  currency?: string;
}

export interface TopUpInput {
  walletId: string;
  amount: number;
  method: "card" | "bank_transfer" | "ussd";
  gateway?: string;
  gatewayReference?: string;
}

export interface WithdrawInput {
  walletId: string;
  amount: number;
  bankAccountCode: string;
  description?: string;
}

export interface SpendInput {
  walletId: string;
  amount: number;
  orderId: string;
  description?: string;
}

// ---- Get or Create Wallet ----

export async function getOrCreateWallet(input: CreateWalletInput): Promise<WalletInfo> {
  const existing = await prisma.payWallet.findUnique({ where: { ownerId: input.ownerId } });
  if (existing) return formatWallet(existing);

  const wallet = await prisma.payWallet.create({
    data: {
      ownerId: input.ownerId,
      ownerType: input.ownerType,
      currency: input.currency || "NGN",
    },
  });
  return formatWallet(wallet);
}

export async function getWalletByOwner(ownerId: string): Promise<WalletInfo | null> {
  const wallet = await prisma.payWallet.findUnique({ where: { ownerId } });
  return wallet ? formatWallet(wallet) : null;
}

export async function getWalletById(walletId: string): Promise<WalletInfo | null> {
  const wallet = await prisma.payWallet.findUnique({ where: { id: walletId } });
  return wallet ? formatWallet(wallet) : null;
}

// ---- Top Up (Card / Bank Transfer / USSD) ----

export async function topUpWallet(input: TopUpInput): Promise<WalletTransaction> {
  const wallet = await prisma.payWallet.findUnique({ where: { id: input.walletId } });
  if (!wallet) throw new Error("Wallet not found");
  if (wallet.status !== "active") throw new Error("Wallet is not active");
  if (input.amount <= 0) throw new Error("Amount must be positive");

  const currentBalance = Number(wallet.balance);
  const newBalance = currentBalance + input.amount;

  const [updatedWallet, txn] = await prisma.$transaction([
    prisma.payWallet.update({
      where: { id: input.walletId },
      data: { balance: newBalance, lastActivity: new Date() },
    }),
    prisma.payTransaction.create({
      data: {
        walletId: input.walletId,
        transactionType: "top_up",
        amount: input.amount,
        direction: "credit",
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceType: "manual",
        description: `Wallet top-up of ₦${input.amount.toLocaleString()} via ${input.method}`,
        gateway: input.gateway || input.method,
        gatewayReference: input.gatewayReference || null,
        status: "completed",
      },
    }),
  ]);

  return formatTransaction(txn);
}

// ---- Spend from Wallet (at checkout) ----

export async function spendFromWallet(input: SpendInput): Promise<WalletTransaction> {
  const wallet = await prisma.payWallet.findUnique({ where: { id: input.walletId } });
  if (!wallet) throw new Error("Wallet not found");
  if (wallet.status !== "active") throw new Error("Wallet is not active");
  if (input.amount <= 0) throw new Error("Amount must be positive");

  const currentBalance = Number(wallet.balance);
  if (currentBalance < input.amount) throw new Error("Insufficient wallet balance");

  const newBalance = currentBalance - input.amount;

  const [updatedWallet, txn] = await prisma.$transaction([
    prisma.payWallet.update({
      where: { id: input.walletId },
      data: { balance: newBalance, lastActivity: new Date() },
    }),
    prisma.payTransaction.create({
      data: {
        walletId: input.walletId,
        transactionType: "purchase",
        amount: input.amount,
        direction: "debit",
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceType: "order",
        referenceId: input.orderId,
        description: input.description || `Payment for order`,
        gateway: "internal",
        status: "completed",
      },
    }),
  ]);

  return formatTransaction(txn);
}

// ---- Refund to Wallet ----

export async function refundToWallet(
  walletId: string,
  amount: number,
  orderId: string,
  description?: string
): Promise<WalletTransaction> {
  const wallet = await prisma.payWallet.findUnique({ where: { id: walletId } });
  if (!wallet) throw new Error("Wallet not found");
  if (amount <= 0) throw new Error("Amount must be positive");

  const currentBalance = Number(wallet.balance);
  const newBalance = currentBalance + amount;

  const [, txn] = await prisma.$transaction([
    prisma.payWallet.update({
      where: { id: walletId },
      data: { balance: newBalance, lastActivity: new Date() },
    }),
    prisma.payTransaction.create({
      data: {
        walletId,
        transactionType: "refund",
        amount,
        direction: "credit",
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceType: "order",
        referenceId: orderId,
        description: description || `Refund for order`,
        gateway: "internal",
        status: "completed",
      },
    }),
  ]);

  return formatTransaction(txn);
}

// ---- Withdraw to Bank ----

export async function requestWithdrawal(input: WithdrawInput): Promise<WalletTransaction> {
  const wallet = await prisma.payWallet.findUnique({ where: { id: input.walletId } });
  if (!wallet) throw new Error("Wallet not found");
  if (wallet.status !== "active") throw new Error("Wallet is not active");
  if (input.amount <= 0) throw new Error("Amount must be positive");
  if (input.amount < 1000) throw new Error("Minimum withdrawal is ₦1,000");

  const currentBalance = Number(wallet.balance);
  if (currentBalance < input.amount) throw new Error("Insufficient wallet balance");

  const dailyWithdrawalLimit = Number(wallet.dailyWithdrawalLimit);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayWithdrawals = await prisma.payTransaction.aggregate({
    where: {
      walletId: input.walletId,
      transactionType: "withdrawal",
      direction: "debit",
      createdAt: { gte: todayStart },
      status: "completed",
    },
    _sum: { amount: true },
  });

  const todayTotal = Number(todayWithdrawals._sum.amount || 0);
  if (todayTotal + input.amount > dailyWithdrawalLimit) {
    throw new Error(`Daily withdrawal limit of ₦${dailyWithdrawalLimit.toLocaleString()} exceeded`);
  }

  const newBalance = currentBalance - input.amount;

  const [, txn] = await prisma.$transaction([
    prisma.payWallet.update({
      where: { id: input.walletId },
      data: { balance: newBalance, lastActivity: new Date() },
    }),
    prisma.payTransaction.create({
      data: {
        walletId: input.walletId,
        transactionType: "withdrawal",
        amount: input.amount,
        direction: "debit",
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceType: "payout",
        description: input.description || `Withdrawal to bank`,
        gateway: "paystack",
        gatewayReference: input.bankAccountCode,
        status: input.amount > 50000 ? "pending" : "completed",
      },
    }),
  ]);

  return formatTransaction(txn);
}

// ---- Transfer Between Wallets ----

export async function transferBetweenWallets(
  fromWalletId: string,
  toWalletId: string,
  amount: number,
  description?: string
): Promise<{ debit: WalletTransaction; credit: WalletTransaction }> {
  if (amount <= 0) throw new Error("Amount must be positive");

  const [fromWallet, toWallet] = await Promise.all([
    prisma.payWallet.findUnique({ where: { id: fromWalletId } }),
    prisma.payWallet.findUnique({ where: { id: toWalletId } }),
  ]);

  if (!fromWallet || !toWallet) throw new Error("Wallet not found");
  if (Number(fromWallet.balance) < amount) throw new Error("Insufficient balance");

  const fromBalance = Number(fromWallet.balance);
  const toBalance = Number(toWallet.balance);

  const [debitTxn, creditTxn] = await prisma.$transaction([
    prisma.payWallet.update({
      where: { id: fromWalletId },
      data: { balance: fromBalance - amount, lastActivity: new Date() },
    }),
    prisma.payWallet.update({
      where: { id: toWalletId },
      data: { balance: toBalance + amount, lastActivity: new Date() },
    }),
    prisma.payTransaction.create({
      data: {
        walletId: fromWalletId,
        transactionType: "transfer",
        amount,
        direction: "debit",
        balanceBefore: fromBalance,
        balanceAfter: fromBalance - amount,
        description: description || "Transfer to another wallet",
        gateway: "internal",
        status: "completed",
      },
    }),
    prisma.payTransaction.create({
      data: {
        walletId: toWalletId,
        transactionType: "transfer",
        amount,
        direction: "credit",
        balanceBefore: toBalance,
        balanceAfter: toBalance + amount,
        description: description || "Transfer from another wallet",
        gateway: "internal",
        status: "completed",
      },
    }),
  ]);

  return {
    debit: formatTransaction(debitTxn),
    credit: formatTransaction(creditTxn),
  };
}

// ---- Get Transaction History ----

export async function getWalletTransactions(
  walletId: string,
  options: { limit?: number; offset?: number; type?: string } = {}
): Promise<{ transactions: WalletTransaction[]; total: number }> {
  const { limit = 20, offset = 0, type } = options;

  const where: Record<string, unknown> = { walletId };
  if (type) where.transactionType = type;

  const [transactions, total] = await Promise.all([
    prisma.payTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.payTransaction.count({ where }),
  ]);

  return {
    transactions: transactions.map(formatTransaction),
    total,
  };
}

// ---- Set/Verify PIN ----

export async function setWalletPin(walletId: string, pinHash: string): Promise<void> {
  await prisma.payWallet.update({
    where: { id: walletId },
    data: { pinHash },
  });
}

export async function verifyWalletPin(walletId: string, pinHash: string): Promise<boolean> {
  const wallet = await prisma.payWallet.findUnique({ where: { id: walletId } });
  if (!wallet || !wallet.pinHash) return false;
  return wallet.pinHash === pinHash;
}

// ---- Freeze / Unfreeze ----

export async function freezeWallet(walletId: string): Promise<void> {
  await prisma.payWallet.update({
    where: { id: walletId },
    data: { status: "frozen" },
  });
}

export async function unfreezeWallet(walletId: string): Promise<void> {
  await prisma.payWallet.update({
    where: { id: walletId },
    data: { status: "active" },
  });
}

// ---- Update Spending Limits ----

export async function updateWalletLimits(
  walletId: string,
  limits: {
    dailySpendLimit?: number;
    dailyWithdrawalLimit?: number;
    singleTransactionLimit?: number;
  }
): Promise<void> {
  await prisma.payWallet.update({
    where: { id: walletId },
    data: {
      ...(limits.dailySpendLimit !== undefined && { dailySpendLimit: limits.dailySpendLimit }),
      ...(limits.dailyWithdrawalLimit !== undefined && { dailyWithdrawalLimit: limits.dailyWithdrawalLimit }),
      ...(limits.singleTransactionLimit !== undefined && { singleTransactionLimit: limits.singleTransactionLimit }),
    },
  });
}

// ---- Admin: Get All Wallets ----

export async function getAllWallets(
  options: { limit?: number; offset?: number; ownerType?: string; status?: string } = {}
): Promise<{ wallets: WalletInfo[]; total: number }> {
  const { limit = 50, offset = 0, ownerType, status } = options;

  const where: Record<string, unknown> = {};
  if (ownerType) where.ownerType = ownerType;
  if (status) where.status = status;

  const [wallets, total] = await Promise.all([
    prisma.payWallet.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.payWallet.count({ where }),
  ]);

  return {
    wallets: wallets.map(formatWallet),
    total,
  };
}

// ---- Helpers ----

function formatWallet(w: Record<string, unknown>): WalletInfo {
  const balance = Number(w.balance);
  const pending = Number(w.pendingBalance);
  const reserved = Number(w.reservedBalance);
  return {
    id: w.id as string,
    ownerId: w.ownerId as string,
    ownerType: w.ownerType as string,
    balance,
    pendingBalance: pending,
    reservedBalance: reserved,
    availableBalance: balance - reserved,
    currency: w.currency as string,
    status: w.status as string,
    dailySpendLimit: Number(w.dailySpendLimit),
    dailyWithdrawalLimit: Number(w.dailyWithdrawalLimit),
    singleTransactionLimit: Number(w.singleTransactionLimit),
    hasPin: !!w.pinHash,
    lastActivity: w.lastActivity as Date | null,
  };
}

function formatTransaction(t: Record<string, unknown>): WalletTransaction {
  return {
    id: t.id as string,
    transactionType: t.transactionType as string,
    amount: Number(t.amount),
    direction: t.direction as string,
    balanceBefore: Number(t.balanceBefore),
    balanceAfter: Number(t.balanceAfter),
    referenceType: t.referenceType as string | null,
    referenceId: t.referenceId as string | null,
    description: t.description as string | null,
    gateway: t.gateway as string | null,
    gatewayReference: t.gatewayReference as string | null,
    status: t.status as string,
    flagged: t.flagged as boolean,
    createdAt: t.createdAt as Date,
  };
}
