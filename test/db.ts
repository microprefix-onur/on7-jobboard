import { sql } from 'drizzle-orm';
import { createDatabase } from '../src/lib/server/db/client';
import { jobPosting } from '../src/lib/server/db/schema';
import { TEST_DATABASE_URL } from './env';

const database = createDatabase(TEST_DATABASE_URL);

export const testDb = database.db;
export const closeTestDb = database.close;

export async function resetDb() {
	await testDb.execute(sql`truncate table ${jobPosting} cascade`);
}

export async function insertJobPosting(values: Partial<typeof jobPosting.$inferInsert> = {}) {
	const [row] = await testDb
		.insert(jobPosting)
		.values({
			recruiterId: 'recruiter-a',
			title: 'Softwareentwickler',
			description: 'Wir suchen Verstärkung.',
			...values
		})
		.returning();
	return row;
}
