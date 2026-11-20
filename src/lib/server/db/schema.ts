import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const postingStatus = pgEnum('posting_status', ['open', 'closed']);

export const jobPosting = pgTable('job_posting', {
	id: uuid('id').primaryKey().defaultRandom(),
	// Becomes a foreign key to the recruiter (better-auth user) once that table exists.
	recruiterId: text('recruiter_id').notNull(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	status: postingStatus('status').notNull().default('open'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});
