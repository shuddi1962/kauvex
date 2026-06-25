import prisma from "@/lib/db";

// ============================================================
// KAUVEX PAY — Float Income Accounting
// ============================================================

export interface FloatSnapshot {
  date: Date;
  totalWalletBalance: number;
  customerBalance: number;
  vendorBalance: number;
  partnerBalance: number;
  estimatedInterest: number;
}

// ---- Record Daily Float Snapshot ----

export async function recordDailyFloat(): Promise<FloatSnapshot> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const wallets = await prisma.payWallet.groupBy({
    by: ["ownerType"],
    where: { status: "active" },
    _sum: { balance: true },
  });

  let customerBalance = 0;
  let vendorBalance = 0;
  let partnerBalance = 0;

  for (const w of wallets) {
    const sum = Number(w._sum.balance || 0);
    if (w.ownerType === "customer") customerBalance = sum;
    else if (w.ownerType === "vendor") vendorBalance = sum;
    else partnerBalance += sum;
  }

  const totalBalance = customerBalance + vendorBalance + partnerBalance;
  const annualRate = Number(process.env.FLOAT_ANNUAL_RATE || 0.05); // 5% default
  const dailyInterest = totalBalance * (annualRate / 365);

  const snapshot = await prisma.payFloatTracking.upsert({
    where: { date: today },
    update: {
      totalWalletBalance: totalBalance,
      customerBalance,
      vendorBalance,
      partnerBalance,
      estimatedInterest: dailyInterest,
    },
    create: {
      date: today,
      totalWalletBalance: totalBalance,
      customerBalance,
      vendorBalance,
      partnerBalance,
      estimatedInterest: dailyInterest,
    },
  });

  return {
    date: snapshot.date,
    totalWalletBalance: Number(snapshot.totalWalletBalance),
    customerBalance: Number(snapshot.customerBalance),
    vendorBalance: Number(snapshot.vendorBalance),
    partnerBalance: Number(snapshot.partnerBalance),
    estimatedInterest: Number(snapshot.estimatedInterest),
  };
}

// ---- Get Float History ----

export async function getFloatHistory(
  days: number = 30
): Promise<FloatSnapshot[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const snapshots = await prisma.payFloatTracking.findMany({
    where: { date: { gte: since } },
    orderBy: { date: "desc" },
  });

  return snapshots.map((s) => ({
    date: s.date,
    totalWalletBalance: Number(s.totalWalletBalance),
    customerBalance: Number(s.customerBalance),
    vendorBalance: Number(s.vendorBalance),
    partnerBalance: Number(s.partnerBalance),
    estimatedInterest: Number(s.estimatedInterest),
  }));
}

// ---- Get Float Summary ----

export async function getFloatSummary(): Promise<{
  currentBalance: number;
  monthlyInterest: number;
  yearlyProjection: number;
  highestBalance: number;
  lowestBalance: number;
}> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [latest, monthlyAgg, monthlySnapshots] = await Promise.all([
    prisma.payFloatTracking.findFirst({
      orderBy: { date: "desc" },
    }),
    prisma.payFloatTracking.aggregate({
      where: { date: { gte: monthStart } },
      _sum: { estimatedInterest: true },
      _max: { totalWalletBalance: true },
      _min: { totalWalletBalance: true },
    }),
    prisma.payFloatTracking.findMany({
      where: { date: { gte: monthStart } },
      select: { estimatedInterest: true },
    }),
  ]);

  const monthlyInterest = monthlySnapshots.reduce(
    (sum, s) => sum + Number(s.estimatedInterest),
    0
  );

  return {
    currentBalance: Number(latest?.totalWalletBalance || 0),
    monthlyInterest,
    yearlyProjection: monthlyInterest * 12,
    highestBalance: Number(monthlyAgg._max.totalWalletBalance || 0),
    lowestBalance: Number(monthlyAgg._min.totalWalletBalance || 0),
  };
}
