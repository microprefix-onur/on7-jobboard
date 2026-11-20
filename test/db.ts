import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { createDatabase } from '../src/lib/server/db/client';
import { application, jobPosting, user } from '../src/lib/server/db/schema';
import { TEST_DATABASE_URL } from './env';

const database = createDatabase(TEST_DATABASE_URL);

export const testDb = database.db;
export const closeTestDb = database.close;

export async function resetDb() {
	await testDb.execute(sql`truncate table ${jobPosting}, ${user} cascade`);
}

// Recruiters are inserted directly, so tests don't depend on better-auth.
export async function insertRecruiter(values: Partial<typeof user.$inferInsert> = {}) {
	const id = randomUUID();
	const [row] = await testDb
		.insert(user)
		.values({ id, name: 'Rita Recruiter', email: `${id}@example.com`, ...values })
		.returning();
	return row;
}

export async function insertJobPosting(values: Partial<typeof jobPosting.$inferInsert> = {}) {
	const recruiterId = values.recruiterId ?? (await insertRecruiter()).id;
	const [row] = await testDb
		.insert(jobPosting)
		.values({
			title: 'Softwareentwickler',
			description: 'Wir suchen Verstärkung.',
			...values,
			recruiterId
		})
		.returning();
	return row;
}

export async function insertApplication(
	values: Partial<typeof application.$inferInsert> & { jobPostingId: string }
) {
	const [row] = await testDb
		.insert(application)
		.values({
			applicantName: 'Alex Applicant',
			applicantEmail: `${randomUUID()}@example.com`,
			coverText: 'Ich koche gern.',
			...values
		})
		.returning();
	return row;
}
