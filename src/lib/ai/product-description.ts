import { createOpenRouterClient } from './openrouter'

export interface ProductDescriptionParams {
  name: string
  category: string
  features: string[]
  brand?: string
  language?: string
  targetAudience?: string
  tone?: 'professional' | 'casual' | 'luxury' | 'technical'
}

export interface GeneratedProductDescription {
  title: string
  shortDescription: string
  longDescription: string
  bulletPoints: string[]
  metaTitle: string
  metaDescription: string
}

const DESCRIPTION_SCHEMA = {
  title: 'string (SEO-optimized product title, max 70 chars)',
  shortDescription: 'string (one sentence summary, max 160 chars)',
  longDescription: 'string (2-3 paragraphs of compelling product description)',
  bulletPoints: 'string[] (5-8 key selling points as concise bullets)',
  metaTitle: 'string (SEO meta title, max 60 chars)',
  metaDescription: 'string (SEO meta description, max 160 chars)',
}

function buildSystemPrompt(language?: string, tone?: string): string {
  const lang = language || 'en'
  const t = tone || 'professional'

  return `You are a professional e-commerce copywriter for KAUVEX marketplace.
Write persuasive, accurate product descriptions in language code: ${lang}.
Tone: ${t}.

Rules:
- Highlight benefits, not just features
- Use natural keywords for SEO
- Never invent technical specifications not provided
- Keep paragraphs short and scannable
- Use active voice
- Return ONLY valid JSON matching the schema`
}

function buildPrompt(params: ProductDescriptionParams): string {
  const { name, category, features, brand, targetAudience } = params

  return `Generate a product description for:

Product Name: ${name}
Category: ${category}
${brand ? `Brand: ${brand}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
Features:
${features.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}

Generate title, shortDescription, longDescription (2-3 paragraphs), bulletPoints (5-8 items), metaTitle, and metaDescription.`
}

export async function generateProductDescription(
  params: ProductDescriptionParams
): Promise<GeneratedProductDescription> {
  const client = createOpenRouterClient()

  const systemPrompt = buildSystemPrompt(params.language, params.tone)
  const prompt = buildPrompt(params)

  const result = await client.generateJSON<GeneratedProductDescription>(
    { prompt, systemPrompt },
    DESCRIPTION_SCHEMA as unknown as Record<string, unknown>
  )

  return {
    title: result.title || params.name,
    shortDescription: result.shortDescription || '',
    longDescription: result.longDescription || '',
    bulletPoints: Array.isArray(result.bulletPoints) ? result.bulletPoints : [],
    metaTitle: result.metaTitle || params.name,
    metaDescription: result.metaDescription || result.shortDescription || '',
  }
}
