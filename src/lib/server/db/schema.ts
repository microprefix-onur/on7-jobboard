import { pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { applicationStatuses } from '../../schemas/application';
import { postingStatuses } from '../../schemas/job-posting';
import { user } from './auth.schema';

export * from './auth.schema';

export const postingStatus = pgEnum('posting_status', postingStatuses);
export const applicationStatus = pgEnum('application_status', applicationStatuses);

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

export const application = pgTable(
	'application',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		jobPostingId: uuid('job_posting_id')
			.notNull()
			.references(() => jobPosting.id),
		applicantName: text('applicant_name').notNull(),
		// Stored trimmed and lowercased, so the unique constraint compares normalised emails.
		applicantEmail: text('applicant_email').notNull(),
		coverText: text('cover_text').notNull(),
		status: applicationStatus('status').notNull().default('new'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [unique('application_one_per_email').on(table.jobPostingId, table.applicantEmail)]
);
