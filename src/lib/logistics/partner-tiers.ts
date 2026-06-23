type PartnerTier = 'new' | 'verified' | 'trusted' | 'premium';

interface TierBenefits {
  tier: PartnerTier;
  label: string;
  maxJobDistanceKm: number;
  maxPackageWeightKg: number;
  payoutSchedule: 'instant' | 'daily' | 'weekly' | 'biweekly';
  priorityAccess: boolean;
  dedicatedSupport: boolean;
  kitIncluded: boolean;
  bonusPerJob: number;
  bonusDescription: string;
  jobAccess: string;
  supportLevel: string;
}

const TIER_BENEFITS_MAP: Record<PartnerTier, TierBenefits> = {
  new: {
    tier: 'new',
    label: 'New Partner',
    maxJobDistanceKm: 10,
    maxPackageWeightKg: 10,
    payoutSchedule: 'weekly',
    priorityAccess: false,
    dedicatedSupport: false,
    kitIncluded: false,
    bonusPerJob: 0,
    bonusDescription: 'No bonus',
    jobAccess: 'Standard local deliveries only',
    supportLevel: 'Email support',
  },
  verified: {
    tier: 'verified',
    label: 'Verified Partner',
    maxJobDistanceKm: 25,
    maxPackageWeightKg: 30,
    payoutSchedule: 'daily',
    priorityAccess: false,
    dedicatedSupport: false,
    kitIncluded: true,
    bonusPerJob: 0.5,
    bonusDescription: '₦0.50 bonus per job',
    jobAccess: 'Local deliveries + domestic freight up to 30kg',
    supportLevel: 'Email & chat support',
  },
  trusted: {
    tier: 'trusted',
    label: 'Trusted Partner',
    maxJobDistanceKm: 50,
    maxPackageWeightKg: 100,
    payoutSchedule: 'daily',
    priorityAccess: true,
    dedicatedSupport: false,
    kitIncluded: true,
    bonusPerJob: 1.0,
    bonusDescription: '₦1.00 bonus per job',
    jobAccess: 'All domestic deliveries including freight',
    supportLevel: 'Priority email, chat & phone support',
  },
  premium: {
    tier: 'premium',
    label: 'Premium Partner',
    maxJobDistanceKm: 100,
    maxPackageWeightKg: 500,
    payoutSchedule: 'instant',
    priorityAccess: true,
    dedicatedSupport: true,
    kitIncluded: true,
    bonusPerJob: 2.5,
    bonusDescription: '₦2.50 bonus per job + peak multipliers',
    jobAccess: 'All domestic + international last-mile handoff',
    supportLevel: 'Dedicated account manager, 24/7 priority support',
  },
};

const TIER_THRESHOLDS: { jobs: number; rating: number; maxIncidents: number }[] = [
  { jobs: 0, rating: 0, maxIncidents: Infinity },
  { jobs: 50, rating: 4.0, maxIncidents: 3 },
  { jobs: 200, rating: 4.3, maxIncidents: 2 },
  { jobs: 1000, rating: 4.6, maxIncidents: 0 },
];

const TIER_ORDER: PartnerTier[] = ['new', 'verified', 'trusted', 'premium'];

export function calculatePartnerTier(
  jobsCompleted: number,
  rating: number,
  incidents: number
): PartnerTier {
  let tierIndex = 0;

  for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    const threshold = TIER_THRESHOLDS[i];
    if (
      jobsCompleted >= threshold.jobs &&
      rating >= threshold.rating &&
      incidents <= threshold.maxIncidents
    ) {
      tierIndex = i;
      break;
    }
  }

  return TIER_ORDER[tierIndex];
}

export function getTierBenefits(tier: PartnerTier): TierBenefits {
  return TIER_BENEFITS_MAP[tier];
}

export function getTierProgress(
  currentJobs: number,
  currentRating: number
): { nextTier: PartnerTier | null; jobsNeeded: number; ratingNeeded: number } {
  const currentIndex = TIER_ORDER.indexOf(calculatePartnerTier(currentJobs, currentRating, 0));
  const nextIndex = currentIndex + 1;

  if (nextIndex >= TIER_ORDER.length) {
    return { nextTier: null, jobsNeeded: 0, ratingNeeded: 0 };
  }

  const nextThreshold = TIER_THRESHOLDS[nextIndex];

  return {
    nextTier: TIER_ORDER[nextIndex],
    jobsNeeded: Math.max(0, nextThreshold.jobs - currentJobs),
    ratingNeeded: Math.max(0, nextThreshold.rating - currentRating),
  };
}

export type { PartnerTier, TierBenefits };
