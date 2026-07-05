import { prisma } from '@/lib/prisma'

export async function seedGamification() {
  const existingWheel = await prisma.spinWheelConfig.findFirst()
  if (existingWheel) return

  const spinWheel = await prisma.spinWheelConfig.create({
    data: {
      name: 'Daily Prize Wheel',
      spinsPerDay: 3,
      costInPoints: 0,
      isActive: true,
    },
  })

  const prizes = [
    { label: '5 pts', type: 'points', points: 5, weight: 25, color: '#94A3B8' },
    { label: '10 pts', type: 'points', points: 10, weight: 20, color: '#CBD5E1' },
    { label: '25 pts', type: 'points', points: 25, weight: 15, color: '#FCD34D' },
    { label: '50 pts', type: 'points', points: 50, weight: 10, color: '#F59E0B' },
    { label: '100 pts', type: 'points', points: 100, weight: 5, color: '#FF6B00' },
    { label: 'Free Ship', type: 'free_shipping', value: 'free_shipping', points: 0, weight: 8, color: '#10B981' },
    { label: '5% Off', type: 'discount', discountPercent: 5, points: 0, weight: 10, color: '#8B5CF6' },
    { label: 'Try Again', type: 'bad_luck', points: 0, weight: 7, color: '#EF4444' },
  ]

  for (const prize of prizes) {
    await prisma.spinWheelPrize.create({
      data: {
        configId: spinWheel.id,
        label: prize.label,
        type: prize.type,
        points: prize.points,
        value: prize.type === 'free_shipping' ? 'free_shipping' : prize.type === 'discount' ? `${prize.discountPercent}` : null,
        discountPercent: prize.type === 'discount' ? prize.discountPercent! : null,
        weight: prize.weight,
        color: prize.color,
      } as any,
    })
  }

  const achievements = [
    { code: 'first_order', name: 'First Order', description: 'Place your first order', category: 'orders', threshold: 1, pointsReward: 50, badgeColor: '#FF6B00' },
    { code: 'five_orders', name: 'Shopaholic', description: 'Place 5 orders', category: 'orders', threshold: 5, pointsReward: 100, badgeColor: '#F59E0B' },
    { code: 'ten_orders', name: 'Loyal Customer', description: 'Place 10 orders', category: 'orders', threshold: 10, pointsReward: 200, badgeColor: '#8B5CF6' },
    { code: 'twenty_five_orders', name: 'VIP Shopper', description: 'Place 25 orders', category: 'orders', threshold: 25, pointsReward: 500, badgeColor: '#10B981' },
    { code: 'streak_3d', name: 'Getting Started', description: '3-day check-in streak', category: 'streak', threshold: 3, pointsReward: 30, badgeColor: '#3B82F6' },
    { code: 'streak_7d', name: 'Week Warrior', description: '7-day check-in streak', category: 'streak', threshold: 7, pointsReward: 100, badgeColor: '#8B5CF6' },
    { code: 'streak_14d', name: 'Fortnight Champion', description: '14-day check-in streak', category: 'streak', threshold: 14, pointsReward: 200, badgeColor: '#F59E0B' },
    { code: 'streak_30d', name: 'Monthly Legend', description: '30-day check-in streak', category: 'streak', threshold: 30, pointsReward: 500, badgeColor: '#FF6B00' },
    { code: 'streak_90d', name: 'Quarterly King', description: '90-day check-in streak', category: 'streak', threshold: 90, pointsReward: 1000, badgeColor: '#EF4444' },
    { code: 'streak_365d', name: 'Yearly God', description: '365-day check-in streak', category: 'streak', threshold: 365, pointsReward: 5000, badgeColor: '#FF6B00' },
    { code: 'first_referral', name: 'Friend Inviter', description: 'Refer your first friend', category: 'referrals', threshold: 1, pointsReward: 100, badgeColor: '#3B82F6' },
    { code: 'five_referrals', name: 'Social Butterfly', description: 'Refer 5 friends', category: 'referrals', threshold: 5, pointsReward: 250, badgeColor: '#8B5CF6' },
    { code: 'ten_referrals', name: 'Influencer', description: 'Refer 10 friends', category: 'referrals', threshold: 10, pointsReward: 500, badgeColor: '#F59E0B' },
    { code: 'first_review', name: 'Critic', description: 'Write your first product review', category: 'reviews', threshold: 1, pointsReward: 25, badgeColor: '#10B981' },
    { code: 'ten_reviews', name: 'Top Reviewer', description: 'Write 10 product reviews', category: 'reviews', threshold: 10, pointsReward: 150, badgeColor: '#8B5CF6' },
    { code: 'first_share', name: 'Social Sharer', description: 'Share a product or referral link', category: 'social', threshold: 1, pointsReward: 10, badgeColor: '#3B82F6' },
    { code: 'twenty_five_shares', name: 'Viral', description: 'Share 25 times', category: 'social', threshold: 25, pointsReward: 150, badgeColor: '#EF4444' },
    { code: 'big_spender', name: 'Big Spender', description: 'Spend over ₦100,000 total', category: 'spending', threshold: 100000, pointsReward: 500, badgeColor: '#FF6B00' },
    { code: 'whale', name: 'Whale', description: 'Spend over ₦1,000,000 total', category: 'spending', threshold: 1000000, pointsReward: 2000, badgeColor: '#FF6B00' },
  ]

  for (const achievement of achievements) {
    await prisma.achievement.create({ data: achievement } as any)
  }

  const milestones = [
    { referralsRequired: 1, label: 'First Referral', rewardType: 'points', rewardValue: 50, rewardLabel: '+50 pts' },
    { referralsRequired: 3, label: '3 Referrals', rewardType: 'points', rewardValue: 150, rewardLabel: '+150 pts' },
    { referralsRequired: 5, label: '5 Referrals', rewardType: 'wallet', rewardValue: 500, rewardLabel: '₦500 wallet' },
    { referralsRequired: 10, label: '10 Referrals', rewardType: 'wallet', rewardValue: 1500, rewardLabel: '₦1,500 wallet' },
    { referralsRequired: 25, label: '25 Referrals', rewardType: 'wallet', rewardValue: 5000, rewardLabel: '₦5,000 wallet' },
    { referralsRequired: 50, label: '50 Referrals', rewardType: 'wallet', rewardValue: 15000, rewardLabel: '₦15,000 wallet' },
  ]

  for (const milestone of milestones) {
    await prisma.referralMilestone.create({ data: milestone } as any)
  }

  return { wheelSeeded: true, achievementsSeeded: achievements.length, milestonesSeeded: milestones.length }
}
