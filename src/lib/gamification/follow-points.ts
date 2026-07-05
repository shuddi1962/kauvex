import { earnPoints } from '@/lib/loyalty'

const FOLLOW_POINTS = 15

export async function rewardFollowPoints(customerId: string, vendorId: string): Promise<number> {
  await earnPoints(customerId, `follow-${vendorId}`, FOLLOW_POINTS)

  return FOLLOW_POINTS
}
