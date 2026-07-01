import prisma from "@/lib/db";

const MAX_ATTEMPTS = 3;
const WINDOW_MINUTES = 15;
const LOCKOUT_MINUTES = 30;

export interface OtpRateCheck {
  allowed: boolean;
  attemptsRemaining: number;
  lockedUntil?: Date;
}

export async function checkOtpRateLimit(
  identifier: string,
  channel: "sms" | "email"
): Promise<OtpRateCheck> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  // Find or create rate limit record
  const existing = await prisma.kv_sec_otp_rate_limit.findFirst({
    where: {
      identifier,
      channel,
      windowStart: { gte: windowStart },
    },
  });

  if (!existing) {
    // First attempt in this window — create record
    await prisma.kv_sec_otp_rate_limit.create({
      data: { identifier, channel, attemptCount: 1, windowStart: new Date() },
    });
    return { allowed: true, attemptsRemaining: MAX_ATTEMPTS - 1 };
  }

  // Check if locked
  if (existing.lockedUntil && existing.lockedUntil > new Date()) {
    return {
      allowed: false,
      attemptsRemaining: 0,
      lockedUntil: existing.lockedUntil,
    };
  }

  // Increment attempt count
  const newCount = existing.attemptCount + 1;

  if (newCount > MAX_ATTEMPTS) {
    // Lock the identifier
    const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    await prisma.kv_sec_otp_rate_limit.update({
      where: { id: existing.id },
      data: { attemptCount: newCount, lockedUntil },
    });
    return { allowed: false, attemptsRemaining: 0, lockedUntil };
  }

  await prisma.kv_sec_otp_rate_limit.update({
    where: { id: existing.id },
    data: { attemptCount: newCount },
  });

  return { allowed: true, attemptsRemaining: MAX_ATTEMPTS - newCount };
}

export async function resetOtpRateLimit(identifier: string, channel: "sms" | "email") {
  const existing = await prisma.kv_sec_otp_rate_limit.findFirst({
    where: { identifier, channel },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    await prisma.kv_sec_otp_rate_limit.update({
      where: { id: existing.id },
      data: { attemptCount: 0, lockedUntil: null },
    });
  }
}

export async function getOtpRateLimits() {
  return prisma.kv_sec_otp_rate_limit.findMany({
    where: { attemptCount: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
