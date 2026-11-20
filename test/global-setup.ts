import postgres from 'postgres';
import { applyMigrations } from '../scripts/apply-migrations.js';
import { TEST_DATABASE_URL } from './env';

// Recreates the test database from scratch and applies the committed drizzle-kit migrations.
export default async function setup() {
	const url = new URL(TEST_DATABASE_URL);
	const name = url.pathname.slice(1);

	const admin = postgres({ ...connectionOf(url), database: 'postgres', onnotice: () => {} });
	await admin.unsafe(`drop database if exists "${name}" with (force)`);
	await admin.unsafe(`create database "${name}"`);
	await admin.end();

	await applyMigrations(TEST_DATABASE_URL);
}

function connectionOf(url: URL) {
	return {
		host: url.hostname,
		port: Number(url.port || 5432),
		username: decodeURIComponent(url.username),
		password: decodeURIComponent(url.password)
	};
}
