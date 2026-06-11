import { createOpenRouterClient } from './openrouter'
import { insforge } from '@/lib/insforge'

export interface MetaTagParams {
  type: 'product' | 'category' | 'vendor'
  name: string
  description?: string
  category?: string
  brand?: string
  tags?: string[]
  language?: string
  storefrontName?: string
}

export interface GeneratedMetaTags {
  metaTitle: string
  metaDescription: string
  focusKeyword: string
  schemaMarkup: Record<string, unknown>
  internalLinks: { text: string; url: string }[]
}

const META_SCHEMA = {
  metaTitle: 'string (max 60 chars, include brand and primary keyword)',
  metaDescription: 'string (max 160 chars, compelling call-to-action)',
  focusKeyword: 'string (single primary keyword phrase)',
  schemaMarkup: 'object (JSON-LD structured data snippet for the page type)',
  internalLinks: 'array of { text: string, url: string } (3-5 relevant internal link suggestions)',
}

function buildSystemPrompt(language?: string): string {
  const lang = language || 'en'
  return `You are an SEO specialist for KAUVEX marketplace.
Generate multilingual SEO metadata in language: ${lang}.

Rules:
- Meta title: max 60 chars, include brand name, primary keyword
- Meta description: max 160 chars, include call-to-action
- Focus keyword: single phrase, high-intent
- Schema markup: valid JSON-LD for the page type
- Internal links: relevant existing pages on the store
- Use ${lang} language for all text
- Return ONLY valid JSON`
}

function buildPrompt(params: MetaTagParams): string {
  const parts: string[] = [`Page Type: ${params.type}`]
  parts.push(`Name: ${params.name}`)
  if (params.description) parts.push(`Description: ${params.description}`)
  if (params.category) parts.push(`Category: ${params.category}`)
  if (params.brand) parts.push(`Brand: ${params.brand}`)
  if (params.tags?.length) parts.push(`Tags: ${params.tags.join(', ')}`)
  if (params.storefrontName) parts.push(`Store: ${params.storefrontName}`)

  parts.push('')
  parts.push('Generate metaTitle, metaDescription, focusKeyword, schemaMarkup, and internalLinks.')

  return parts.join('\n')
}

export async function generateMetaTags(params: MetaTagParams): Promise<GeneratedMetaTags> {
  const client = createOpenRouterClient()

  const systemPrompt = buildSystemPrompt(params.language)
  const prompt = buildPrompt(params)

  const result = await client.generateJSON<GeneratedMetaTags>(
    { prompt, systemPrompt },
    META_SCHEMA as unknown as Record<string, unknown>
  )

  return {
    metaTitle: result.metaTitle || params.name,
    metaDescription: result.metaDescription || '',
    focusKeyword: result.focusKeyword || params.name,
    schemaMarkup: (result.schemaMarkup && typeof result.schemaMarkup === 'object' ? result.schemaMarkup : {}),
    internalLinks: Array.isArray(result.internalLinks) ? result.internalLinks : [],
  }
}

export async function generateBulkMetaTags(
  items: MetaTagParams[]
): Promise<GeneratedMetaTags[]> {
  const results: GeneratedMetaTags[] = []
  for (const item of items) {
    try {
      const tags = await generateMetaTags(item)
      results.push(tags)
    } catch (err) {
      console.error(`[SEO] Failed to generate meta for ${item.name}:`, err)
      results.push({
        metaTitle: item.name,
        metaDescription: item.description || '',
        focusKeyword: item.name,
        schemaMarkup: {},
        internalLinks: [],
      })
    }
  }
  return results
}

export async function updateProductSEOMeta(productId: string, language?: string) {
  const { data: product } = await insforge.database
    .from('products')
    .select('name, short_description, category:categories(name), brand:brands(name), tags')
    .eq('id', productId)
    .single()

  if (!product) throw new Error(`Product ${productId} not found`)

  const tags = await generateMetaTags({
    type: 'product',
    name: product.name,
    description: product.short_description,
    category: (product as any).category?.name,
    brand: (product as any).brand?.name,
    tags: product.tags,
    language,
  })

  return tags
}
