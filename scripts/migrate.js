// Applies the committed drizzle-kit migrations. Used by the `migrate` service in Docker Compose.
import { applyMigrations } from './apply-migrations.js';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

await applyMigrations(url);
console.log('Migrations applied.');
