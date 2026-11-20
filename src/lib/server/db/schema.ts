import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { postingStatuses } from '../../schemas/job-posting';
import { user } from './auth.schema';

export * from './auth.schema';

export const postingStatus = pgEnum('posting_status', postingStatuses);

export const jobPosting = pgTable('job_posting', {
	id: uuid('id').primaryKey().defaultRandom(),
	// A recruiter is a better-auth user.
	recruiterId: text('recruiter_id')
		.notNull()
		.references(() => user.id),
	title: text('title').notNull(),
	description: text('description').notNull(),
	status: postingStatus('status').notNull().default('open'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});
