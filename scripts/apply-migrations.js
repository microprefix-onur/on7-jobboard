import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

/**
 * Applies the committed drizzle-kit migrations to the database at `url`.
 * @param {string} url
 */
export async function applyMigrations(url) {
	const client = postgres(url, { max: 1, onnotice: () => {} });
	try {
		await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
	} finally {
		await client.end();
	}
}
