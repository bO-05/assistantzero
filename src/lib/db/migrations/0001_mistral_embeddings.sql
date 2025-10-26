DROP INDEX IF EXISTS "embeddingIndex";

ALTER TABLE "embeddings" DROP COLUMN IF EXISTS "embedding";

ALTER TABLE "embeddings" ADD COLUMN "embedding" vector(1024) NOT NULL;

CREATE INDEX "embeddingIndex" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);
