CREATE TYPE "public"."posting_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TABLE "job_posting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recruiter_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" "posting_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
