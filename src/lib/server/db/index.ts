import { DATABASE_URL } from '$app/env/private';
import { createDatabase } from './client';

export const { db } = createDatabase(DATABASE_URL);
