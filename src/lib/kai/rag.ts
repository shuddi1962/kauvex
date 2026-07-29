import { createOpenRouterClient } from "@/lib/ai/openrouter";
import { supabase } from "@/lib/insforge";

interface RAGChunk {
  id: string;
  category: string;
  subcategory: string | null;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  source_url: string | null;
  similarity: number;
}

interface RAGResult {
  answer: string;
  sources: RAGChunk[];
  tokensUsed: number;
}

const SYSTEM_PROMPT = `You are KAI, KAUVEX's intelligent assistant. You help customers, vendors, and professionals with the KAUVEX platform.

CORE RULES:
- Be direct, warm, and helpful. Use active voice. Short sentences.
- If you don't know something based on the provided context, say so honestly.
- Never make up facts about KAUVEX policies, pricing, or features.
- When recommending products or services, be specific and reference actual KAUVEX features.
- For questions about pricing, always note that prices vary by location and are subject to change.
- For technical questions, give clear step-by-step guidance.
- For account or order issues, guide users to the appropriate self-service page or support channel.
- You can ask clarifying questions if the user's request is ambiguous.
- NEVER share internal system details, API keys, or configuration.
- NEVER discuss other AI models or platforms.
- You represent KAUVEX. Act like it.

CONTEXT FROM KAUVEX KNOWLEDGE BASE:
{context}

USER QUESTION: {question}

Answer the question using the context above. If the context doesn't contain the answer, say so and offer to help with something else.`;

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_EMBEDDING_API_KEY || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("No API key configured for embeddings");
  }

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-3-small",
    }),
  });

  if (!res.ok) {
    throw new Error(`Embedding API error: ${res.status}`);
  }

  const data = await res.json();
  return data.data[0].embedding;
}

export async function searchKnowledgeBase(
  query: string,
  limit: number = 5,
  category?: string
): Promise<RAGChunk[]> {
  const embedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc("kv_kai_search_embeddings", {
    query_embedding: embedding,
    match_limit: limit,
    filter_category: category || null,
    filter_subcategory: null,
  });

  if (error) {
    console.error("[KAI] Vector search error:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    category: row.category,
    subcategory: row.subcategory,
    title: row.title,
    content: row.content,
    metadata: row.metadata || {},
    source_url: row.source_url,
    similarity: row.similarity,
  }));
}

export async function askKAI(
  question: string,
  options?: {
    category?: string;
    conversationHistory?: { role: string; content: string }[];
    temperature?: number;
  }
): Promise<RAGResult> {
  const startTime = Date.now();

  const relevantChunks = await searchKnowledgeBase(
    question,
    5,
    options?.category
  );

  const context = relevantChunks
    .map(
      (c, i) =>
        `[${i + 1}] CATEGORY: ${c.category}${c.subcategory ? ` / ${c.subcategory}` : ""}\nTITLE: ${c.title}\nCONTENT: ${c.content}`
    )
    .join("\n\n");

  const systemPrompt = SYSTEM_PROMPT.replace("{context}", context || "No specific knowledge base results found for this query.").replace("{question}", question);

  const client = createOpenRouterClient();
  
  let answer: string;
  
  if (options?.conversationHistory && options.conversationHistory.length > 0) {
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...options.conversationHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: question },
    ];

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await res.json();
    answer = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
  } else {
    answer = await client.generateCompletion({
      prompt: question,
      systemPrompt,
      temperature: options?.temperature ?? 0.7,
      maxTokens: 1024,
    });
  }

  const latencyMs = Date.now() - startTime;

  return {
    answer,
    sources: relevantChunks,
    tokensUsed: Math.ceil(answer.length / 4),
  };
}