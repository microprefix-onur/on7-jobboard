import { afterAll, beforeEach } from 'vitest';
import { closeTestDb, resetDb } from './db';

beforeEach(resetDb);
afterAll(closeTestDb);
