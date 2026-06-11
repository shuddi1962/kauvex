const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const DEFAULT_MODEL = 'openai/gpt-4o-mini'
const DEFAULT_TIMEOUT = 30000

interface OpenRouterConfig {
  apiKey?: string
  model?: string
  timeout?: number
}

interface CompletionParams {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

interface OpenRouterResponse {
  id: string
  choices: {
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface OpenRouterError {
  error: {
    code: number
    message: string
  }
}

function getApiKey(): string {
  return process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ''
}

let lastRateLimit = 0

export function createOpenRouterClient(config?: OpenRouterConfig) {
  const apiKey = config?.apiKey || getApiKey()
  const model = config?.model || DEFAULT_MODEL
  const timeout = config?.timeout || DEFAULT_TIMEOUT

  if (!apiKey) {
    throw new Error(
      'OpenRouter API key not configured. Set OPENROUTER_API_KEY or NEXT_PUBLIC_OPENROUTER_API_KEY env var.'
    )
  }

  async function generateCompletion(params: CompletionParams): Promise<string> {
    const { prompt, systemPrompt, temperature = 0.7, maxTokens = 1024 } = params

    enforceRateLimit()

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const body: Record<string, unknown> = {
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }

      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'KAUVEX',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '5', 10)
        lastRateLimit = Date.now() + retryAfter * 1000
        console.warn(`[OpenRouter] Rate limited, waiting ${retryAfter}s`)
        throw new Error(`Rate limited by OpenRouter. Retry after ${retryAfter} seconds.`)
      }

      if (!res.ok) {
        const errBody: OpenRouterError = await res.json().catch(() => ({ error: { code: res.status, message: res.statusText } }))
        throw new Error(`OpenRouter API error ${errBody.error?.code || res.status}: ${errBody.error?.message || res.statusText}`)
      }

      const data: OpenRouterResponse = await res.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('OpenRouter returned empty response')
      }

      console.log(`[OpenRouter] Completion OK — ${data.usage?.total_tokens || 0} tokens`)
      return content
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new Error(`OpenRouter request timed out after ${timeout}ms`)
      }
      throw err
    } finally {
      clearTimeout(timer)
    }
  }

  async function generateJSON<T>(params: CompletionParams, schema?: Record<string, unknown>): Promise<T> {
    const systemPrompt = [
      params.systemPrompt || '',
      'You must respond with valid JSON only. No markdown, no code fences, no explanation.',
      schema ? `Expected JSON structure: ${JSON.stringify(schema)}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const raw = await generateCompletion({
      ...params,
      systemPrompt,
      temperature: params.temperature ?? 0.3,
    })

    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*$/g, '')
      .trim()

    try {
      return JSON.parse(cleaned) as T
    } catch {
      console.error('[OpenRouter] Failed to parse JSON response:', cleaned.slice(0, 200))
      throw new Error('OpenRouter returned invalid JSON')
    }
  }

  return { generateCompletion, generateJSON }
}

function enforceRateLimit() {
  const now = Date.now()
  if (now < lastRateLimit) {
    const wait = Math.ceil((lastRateLimit - now) / 1000)
    throw new Error(`Rate limited. Wait ${wait}s before next request.`)
  }
}

export type OpenRouterClient = ReturnType<typeof createOpenRouterClient>
