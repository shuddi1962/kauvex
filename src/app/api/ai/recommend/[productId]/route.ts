import { NextRequest, NextResponse } from 'next/server'
import { getContentBasedRecommendations, getCollaborativeRecommendations } from '@/lib/ai/recommendations'

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8', 10)
    const customerId = searchParams.get('customerId') || null

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const clampedLimit = Math.min(Math.max(limit, 1), 50)

    const [contentBased, collaborative] = await Promise.all([
      getContentBasedRecommendations(productId, clampedLimit),
      customerId
        ? getCollaborativeRecommendations(customerId, clampedLimit).catch(() => [])
        : Promise.resolve([]),
    ])

    const existingIds = new Set(contentBased.map((r) => r.productId))
    const combined = [
      ...contentBased,
      ...collaborative.filter((r) => !existingIds.has(r.productId)),
    ].slice(0, clampedLimit)

    return NextResponse.json({
      product_id: productId,
      recommendations: combined,
      content_based: contentBased,
      collaborative: collaborative,
      total: combined.length,
    })
  } catch (error) {
    console.error('[AI] Recommendations fetch failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
