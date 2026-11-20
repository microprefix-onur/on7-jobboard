import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { TEST_DATABASE_URL } from './env';

// Creates the test database if needed and applies the committed drizzle-kit migrations.
export default async function setup() {
	const url = new URL(TEST_DATABASE_URL);
	const name = url.pathname.slice(1);

	const admin = postgres({ ...connectionOf(url), database: 'postgres', onnotice: () => {} });
	const [existing] = await admin`select 1 from pg_database where datname = ${name}`;
	if (!existing) await admin.unsafe(`create database "${name}"`);
	await admin.end();

	const client = postgres(TEST_DATABASE_URL, { max: 1, onnotice: () => {} });
	await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
	await client.end();
}

function connectionOf(url: URL) {
	return {
		host: url.hostname,
		port: Number(url.port || 5432),
		username: decodeURIComponent(url.username),
		password: decodeURIComponent(url.password)
	};
}
