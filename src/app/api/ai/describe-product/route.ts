import { NextRequest, NextResponse } from 'next/server'
import { generateProductDescription } from '@/lib/ai/product-description'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, features, brand, language, targetAudience, tone } = body

    if (!name || !category || !features) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, features' },
        { status: 400 }
      )
    }

    if (!Array.isArray(features) || features.length === 0) {
      return NextResponse.json(
        { error: 'features must be a non-empty array' },
        { status: 400 }
      )
    }

    const result = await generateProductDescription({
      name,
      category,
      features,
      brand: brand || undefined,
      language: language || undefined,
      targetAudience: targetAudience || undefined,
      tone: tone || 'professional',
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[AI] Product description generation failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate product description' },
      { status: 500 }
    )
  }
}
