import { q } from "../db/pool.js";
import { embed, toVectorLiteral } from "../lib/embed.js";

export interface SimilarIncident {
  id: string;
  summary: string;
  category: string;
  severity: string;
  distance: number;
}

/**
 * Returns the top-k most similar past incidents to `text` by cosine distance.
 * Only considers rows that actually have an embedding.
 */
export async function findSimilarIncidents(text: string, k = 5): Promise<SimilarIncident[]> {
  const vec = toVectorLiteral(await embed(text));
  const res = await q<SimilarIncident>(
    `SELECT id, summary, category, severity, (embedding <=> $1) AS distance
       FROM errors
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1
      LIMIT $2`,
    [vec, k]
  );
  return res.rows;
}
