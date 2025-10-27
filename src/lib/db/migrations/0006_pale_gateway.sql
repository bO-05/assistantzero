ALTER TABLE "chat_messages" ADD COLUMN "thread_id" varchar(255) DEFAULT 'assistant0-chat';--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "title" text;--> statement-breakpoint
UPDATE "chat_messages" SET "thread_id" = 'assistant0-chat' WHERE "thread_id" IS NULL;