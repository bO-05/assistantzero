-- First update existing NULL values
UPDATE "chat_messages" SET "thread_id" = 'assistant0-chat' WHERE "thread_id" IS NULL;--> statement-breakpoint
-- Then set the default
ALTER TABLE "chat_messages" ALTER COLUMN "thread_id" SET DEFAULT 'assistant0-chat';--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "thread_id" DROP NOT NULL;