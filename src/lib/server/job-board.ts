import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { jobPostingSchema, type JobPostingInput } from '../schemas/job-posting';
import type { Database } from './db/client';
import { jobPosting } from './db/schema';

// The domain module: every business rule of the job board lives here.
// Routes only authenticate, call into it and map its results to responses.
export function createJobBoard(db: Database) {
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
					status: jobPosting.status,
					createdAt: jobPosting.createdAt
				})
				.from(jobPosting)
				.where(eq(jobPosting.recruiterId, recruiterId))
				.orderBy(desc(jobPosting.createdAt));
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
