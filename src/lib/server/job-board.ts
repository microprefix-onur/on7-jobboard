import { desc, eq } from 'drizzle-orm';
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
		}
	};
}
