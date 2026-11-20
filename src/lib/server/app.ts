import { db } from './db';
import { createJobBoard } from './job-board';

export const jobBoard = createJobBoard(db);
