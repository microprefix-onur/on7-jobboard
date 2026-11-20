import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import {
	jobPostingSchema,
	postingStatusSchema,
	type JobPostingInput
} from '../schemas/job-posting';
import { applicationSchema, type ApplicationInput } from '../schemas/application';
import type { Database } from './db/client';
import { application, jobPosting } from './db/schema';

// The domain module: every business rule of the job board lives here.
// Routes only authenticate, call into it and map its results to responses.
export function createJobBoard(db: Database) {
	async function updateOwnPosting(
		recruiterId: string,
		postingId: string,
		values: Partial<typeof jobPosting.$inferInsert>
	) {
		if (!isUuid(postingId)) return notFound;

		const [posting] = await db
			.update(jobPosting)
			.set(values)
			.where(ownPostingFilter(recruiterId, postingId))
			.returning();
		return posting ? { type: 'success' as const, posting } : notFound;
	}

	return {
		listOpenPostings() {
			return db
				.select({
					id: jobPosting.id,
					title: jobPosting.title,
					createdAt: jobPosting.createdAt
				})
				.from(jobPosting)
				.where(eq(jobPosting.status, 'open'))
				.orderBy(desc(jobPosting.createdAt));
		},

		listOwnPostings(recruiterId: string) {
			return db
				.select({
					id: jobPosting.id,
					title: jobPosting.title,
					status: jobPosting.status
				})
				.from(jobPosting)
				.where(eq(jobPosting.recruiterId, recruiterId))
				.orderBy(desc(jobPosting.createdAt));
		},

		async getPublicPosting(postingId: string) {
			if (!isUuid(postingId)) return notFound;

			const [posting] = await db
				.select({
					id: jobPosting.id,
					title: jobPosting.title,
					description: jobPosting.description,
					status: jobPosting.status
				})
				.from(jobPosting)
				.where(eq(jobPosting.id, postingId));
			return posting ? { type: 'success' as const, posting } : notFound;
		},

		async getOwnPosting(recruiterId: string, postingId: string) {
			if (!isUuid(postingId)) return notFound;

			const [posting] = await db
				.select()
				.from(jobPosting)
				.where(ownPostingFilter(recruiterId, postingId));
			return posting ? { type: 'success' as const, posting } : notFound;
		},

		async updatePosting(recruiterId: string, postingId: string, input: JobPostingInput) {
			const parsed = jobPostingSchema.safeParse(input);
			if (!parsed.success) return invalid(parsed.error);

			return updateOwnPosting(recruiterId, postingId, parsed.data);
		},

		async setPostingStatus(recruiterId: string, postingId: string, status: string) {
			const parsed = postingStatusSchema.safeParse({ status });
			if (!parsed.success) return invalid(parsed.error);

			return updateOwnPosting(recruiterId, postingId, parsed.data);
		},

		async submitApplication(postingId: string, input: ApplicationInput) {
			if (!isUuid(postingId)) return notFound;
			const parsed = applicationSchema.safeParse(input);
			if (!parsed.success) return invalid(parsed.error);
			const data = parsed.data;

			// Locking the job posting row makes a concurrent close wait until this insert is done,
			// so a job posting closed while someone applies can't receive the application.
			try {
				return await db.transaction(async (tx) => {
					const [posting] = await tx
						.select({ status: jobPosting.status })
						.from(jobPosting)
						.where(eq(jobPosting.id, postingId))
						.for('share');
					if (!posting) return notFound;
					if (posting.status !== 'open') return { type: 'posting-closed' as const };

					const [created] = await tx
						.insert(application)
						.values({
							jobPostingId: postingId,
							applicantName: data.name,
							applicantEmail: data.email,
							coverText: data.coverText
						})
						.returning();
					return { type: 'success' as const, application: created };
				});
			} catch (error) {
				// The unique constraint also catches two simultaneous applications.
				if (isUniqueViolation(error, 'application_one_per_email')) {
					return { type: 'already-applied' as const };
				}
				throw error;
			}
		},

		async createPosting(recruiterId: string, input: JobPostingInput) {
			const parsed = jobPostingSchema.safeParse(input);
			if (!parsed.success) return invalid(parsed.error);

			const [posting] = await db
				.insert(jobPosting)
				.values({ ...parsed.data, recruiterId })
				.returning();
			return { type: 'success' as const, posting };
		}
	};
}

function invalid<T>(error: z.ZodError<T>) {
	return { type: 'invalid' as const, fieldErrors: z.flattenError(error).fieldErrors };
}

const notFound = { type: 'not-found' } as const;

// Malformed ids from URLs are simply not found, rather than a database error.
function isUuid(id: string) {
	return z.uuid().safeParse(id).success;
}

// Ownership is part of the query: another recruiter's job posting matches nothing.
function ownPostingFilter(recruiterId: string, postingId: string) {
	return and(eq(jobPosting.id, postingId), eq(jobPosting.recruiterId, recruiterId));
}

function isUniqueViolation(error: unknown, constraint: string) {
	const cause = error instanceof Error ? error.cause : undefined;
	return (
		typeof cause === 'object' &&
		cause !== null &&
		'code' in cause &&
		cause.code === '23505' &&
		'constraint_name' in cause &&
		cause.constraint_name === constraint
	);
}
