import prisma from "@/lib/db";

export type BackupType = "daily" | "weekly" | "monthly";
export type BackupStatus = "pending" | "completed" | "failed" | "verified";

const RETENTION = {
  daily: 7,
  weekly: 4,
  monthly: 12,
};

export async function createBackupRecord(type: BackupType, storageLocation: string, fileName: string) {
  return prisma.kv_sec_backup.create({
    data: {
      backupType: type,
      storageLocation,
      fileName,
      status: "pending",
    },
  });
}

export async function completeBackup(id: string, sizeMb: number) {
  return prisma.kv_sec_backup.update({
    where: { id },
    data: { status: "completed", sizeMb },
  });
}

export async function failBackup(id: string, errorMessage: string) {
  return prisma.kv_sec_backup.update({
    where: { id },
    data: { status: "failed", errorMessage },
  });
}

export async function verifyBackup(id: string) {
  return prisma.kv_sec_backup.update({
    where: { id },
    data: { status: "verified", verifiedAt: new Date() },
  });
}

export async function getBackupHistory(limit = 50) {
  return prisma.kv_sec_backup.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getBackupStats() {
  const [totalDaily, totalWeekly, totalMonthly, lastVerified] = await Promise.all([
    prisma.kv_sec_backup.count({ where: { backupType: "daily", status: "completed" } }),
    prisma.kv_sec_backup.count({ where: { backupType: "weekly", status: "completed" } }),
    prisma.kv_sec_backup.count({ where: { backupType: "monthly", status: "completed" } }),
    prisma.kv_sec_backup.findFirst({
      where: { status: "verified" },
      orderBy: { verifiedAt: "desc" },
      select: { verifiedAt: true, createdAt: true },
    }),
  ]);

  const lastBackup = await prisma.kv_sec_backup.findFirst({
    where: { status: "completed" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, sizeMb: true },
  });

  return {
    totalDaily,
    totalWeekly,
    totalMonthly,
    lastBackupDate: lastBackup?.createdAt ?? null,
    lastBackupSize: lastBackup?.sizeMb ?? null,
    lastVerifiedRestore: lastVerified?.verifiedAt ?? null,
  };
}

export async function cleanupOldBackups() {
  const now = new Date();

  for (const [type, keep] of Object.entries(RETENTION)) {
    const cutoff = new Date(now.getTime() - keep * 7 * 24 * 60 * 60 * 1000);
    const oldBackups = await prisma.kv_sec_backup.findMany({
      where: { backupType: type, createdAt: { lt: cutoff } },
      select: { id: true },
    });

    if (oldBackups.length > 0) {
      await prisma.kv_sec_backup.deleteMany({
        where: { id: { in: oldBackups.map((b) => b.id) } },
      });
    }
  }
}
