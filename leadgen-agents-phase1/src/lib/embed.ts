import { config } from "./config.js";

/**
 * Provider-agnostic embedding. All vendor logic lives behind this function.
 * Returns a vector whose length MUST equal EMBEDDINGS_VECTOR_DIM (and the
 * VECTOR(n) column in the migration).
 */
export async function embed(text: string): Promise<number[]> {
  if (config.EMBEDDINGS_PROVIDER === "openai") return embedOpenAI(text);
  // Voyage adapter slot — implement if EMBEDDINGS_PROVIDER=voyage and align dim.
  throw new Error(`Embedding provider not implemented: ${config.EMBEDDINGS_PROVIDER}`);
}

async function embedOpenAI(text: string): Promise<number[]> {
  if (!config.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: config.OPENAI_EMBED_MODEL, input: text }),
  });
  if (!res.ok) throw new Error(`OpenAI embeddings ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { data: { embedding: number[] }[] };
  const vec = data.data[0]?.embedding;
  if (!vec || vec.length !== config.EMBEDDINGS_VECTOR_DIM) {
    throw new Error(
      `Embedding dim mismatch: got ${vec?.length}, expected ${config.EMBEDDINGS_VECTOR_DIM}`
    );
  }
  return vec;
}

/** pgvector literal: '[0.1,0.2,...]' */
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}
