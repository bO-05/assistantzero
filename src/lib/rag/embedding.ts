import { embed, embedMany } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { and, desc, eq, gt, sql, cosineDistance } from 'drizzle-orm';
import { chunk } from 'llm-chunk';

import { db } from '@/lib/db';
import { embeddings } from '@/lib/db/schema/embeddings';
import { documents } from '@/lib/db/schema/documents';
import { auth0 } from '@/lib/auth0';
import { documentReadScope, requireDocumentActor } from '@/lib/document-access';

const embeddingModel = mistral.textEmbedding(process.env.MISTRAL_EMBEDDING_MODEL ?? 'mistral-embed');

export const generateEmbeddings = async (value: string): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = chunk(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string, limit = 4) => {
  const actor = requireDocumentActor((await auth0.getSession())?.user);
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, userQueryEmbedded)})`;
  const similarGuides = await db
    .select({ content: embeddings.content, similarity, documentId: documents.id })
    .from(embeddings)
    .innerJoin(documents, eq(embeddings.documentId, documents.id))
    .where(and(gt(similarity, 0.5), documentReadScope(actor)))
    .orderBy(desc(similarity))
    .limit(limit);
  return similarGuides;
};
