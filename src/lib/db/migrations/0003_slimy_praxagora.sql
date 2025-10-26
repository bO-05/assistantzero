CREATE TABLE "audit_logs" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"action" varchar(100) NOT NULL,
	"tool_name" varchar(100),
	"agent_role" varchar(100),
	"status" varchar(50) NOT NULL,
	"inputs" jsonb,
	"outputs" jsonb,
	"error_message" text,
	"workspace_id" varchar(191),
	"thread_id" varchar(191),
	"risk_score" varchar(50),
	"requires_approval" boolean DEFAULT false,
	"approval_status" varchar(50),
	"duration_ms" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar(191) NOT NULL,
	"user_email" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playbooks" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(300) NOT NULL,
	"description" text,
	"prompt" text NOT NULL,
	"schedule" varchar(100),
	"is_active" boolean DEFAULT true,
	"tools_allowed" varchar(100)[],
	"workspace_id" varchar(191),
	"last_run_at" timestamp,
	"next_run_at" timestamp,
	"run_count" integer DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar(191) NOT NULL,
	"user_email" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(300) NOT NULL,
	"description" text,
	"icon" varchar(50) DEFAULT 'briefcase',
	"color" varchar(50) DEFAULT 'blue',
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar(191) NOT NULL,
	"user_email" varchar(191) NOT NULL
);
