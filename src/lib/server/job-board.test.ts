import { describe, expect, it } from 'vitest';
import { createJobBoard } from './job-board';
import { insertJobPosting, testDb } from '../../../test/db';

const jobBoard = createJobBoard(testDb);

describe('listOpenPostings', () => {
	it('lists open job postings and leaves out closed ones', async () => {
		await insertJobPosting({ title: 'Backend-Entwickler', status: 'open' });
		await insertJobPosting({ title: 'Designer', status: 'closed' });

		const postings = await jobBoard.listOpenPostings();

		expect(postings.map((p) => p.title)).toEqual(['Backend-Entwickler']);
	});

	it('returns nothing when there are no open job postings', async () => {
		await insertJobPosting({ status: 'closed' });

		expect(await jobBoard.listOpenPostings()).toEqual([]);
	});
});
