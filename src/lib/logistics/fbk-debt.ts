type DebtEscalationLevel = 'notice' | 'removal_countdown' | 'liquidation' | 'written_off';

const GRACE_PERIOD_DAYS = 30;
const DEFAULT_MONTHLY_INTEREST_RATE = 0.02;
const DEFAULT_RECOVERY_RATE = 0.5;

export function calculateInterest(
  amount: number,
  daysOverdue: number,
  monthlyRate: number = DEFAULT_MONTHLY_INTEREST_RATE
): number {
  if (daysOverdue <= GRACE_PERIOD_DAYS) {
    return 0;
  }

  const overdueDays = daysOverdue - GRACE_PERIOD_DAYS;
  const monthsOverdue = Math.ceil(overdueDays / 30);
  return +(amount * monthlyRate * monthsOverdue).toFixed(2);
}

export function calculateRecoveryAmount(
  saleNetAmount: number,
  debtBalance: number,
  recoveryRate: number = DEFAULT_RECOVERY_RATE
): { recovered: number; remaining: number } {
  const recoverable = saleNetAmount * recoveryRate;
  const recovered = Math.min(recoverable, debtBalance);
  const remaining = +(debtBalance - recovered).toFixed(2);

  return {
    recovered: +recovered.toFixed(2),
    remaining,
  };
}

const ESCALATION_MAP: { threshold: number; level: DebtEscalationLevel }[] = [
  { threshold: 0, level: 'notice' },
  { threshold: 31, level: 'removal_countdown' },
  { threshold: 61, level: 'liquidation' },
  { threshold: 121, level: 'written_off' },
];

export function getDebtEscalationLevel(daysOverdue: number): DebtEscalationLevel {
  let level: DebtEscalationLevel = 'notice';

  for (const entry of ESCALATION_MAP) {
    if (daysOverdue >= entry.threshold) {
      level = entry.level;
    }
  }

  return level;
}

export type { DebtEscalationLevel };
