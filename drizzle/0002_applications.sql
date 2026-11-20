CREATE TYPE "public"."application_status" AS ENUM('new', 'invited', 'rejected');--> statement-breakpoint
CREATE TABLE "application" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_posting_id" uuid NOT NULL,
	"applicant_name" text NOT NULL,
	"applicant_email" text NOT NULL,
	"cover_text" text NOT NULL,
	"status" "application_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "application_one_per_email" UNIQUE("job_posting_id","applicant_email")
);
--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_job_posting_id_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_posting"("id") ON DELETE no action ON UPDATE no action;