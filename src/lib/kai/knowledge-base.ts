import { supabase } from "@/lib/insforge";
import { generateEmbedding } from "./rag";

interface KnowledgeChunkInput {
  category: string;
  subcategory?: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  sourceUrl?: string;
  language?: string;
}

export async function addToKnowledgeBase(input: KnowledgeChunkInput): Promise<string> {
  const embedding = await generateEmbedding(`${input.title}\n\n${input.content}`);

  const { data, error } = await supabase
    .from("kv_kai_knowledge_chunks")
    .insert({
      category: input.category,
      subcategory: input.subcategory || null,
      title: input.title,
      content: input.content,
      embedding,
      metadata: input.metadata || {},
      source_url: input.sourceUrl || null,
      language: input.language || "en",
      is_active: true,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to add KB entry: ${error.message}`);
  return data.id;
}

export async function removeFromKnowledgeBase(id: string): Promise<void> {
  const { error } = await supabase
    .from("kv_kai_knowledge_chunks")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error(`Failed to deactivate KB entry: ${error.message}`);
}

export async function reindexAll(): Promise<number> {
  const { data: chunks, error } = await supabase
    .from("kv_kai_knowledge_chunks")
    .select("id, title, content")
    .is("embedding", null)
    .eq("is_active", true);

  if (error) throw new Error(`Failed to fetch unindexed chunks: ${error.message}`);
  if (!chunks || chunks.length === 0) return 0;

  let count = 0;
  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(`${chunk.title}\n\n${chunk.content}`);
      await supabase
        .from("kv_kai_knowledge_chunks")
        .update({ embedding })
        .eq("id", chunk.id);
      count++;
    } catch (e) {
      console.error(`[KAI] Failed to index chunk ${chunk.id}:`, e);
    }
  }

  return count;
}