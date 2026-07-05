import { earnPoints } from '@/lib/loyalty'
import { updateProgress } from './achievements'

const REVIEW_POINTS = 25
const PHOTO_REVIEW_BONUS = 15

export async function rewardReviewPoints(customerId: string, productId: string, hasPhoto: boolean): Promise<number> {
  const points = REVIEW_POINTS + (hasPhoto ? PHOTO_REVIEW_BONUS : 0)

  await earnPoints(customerId, `review-${productId}`, points)
  await updateProgress(customerId, 'reviews', 1)

  return points
}
