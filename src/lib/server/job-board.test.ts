import { describe, expect, it } from 'vitest';
import { createJobBoard } from './job-board';
import { insertJobPosting, insertRecruiter, testDb } from '../../../test/db';

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

describe('createPosting', () => {
	it('creates an open job posting that appears in the public list', async () => {
		const recruiter = await insertRecruiter();

		const result = await jobBoard.createPosting(recruiter.id, {
			title: '  Frontend-Entwickler  ',
			description: 'Svelte und TypeScript.'
		});

		expect(result).toMatchObject({
			type: 'success',
			posting: { title: 'Frontend-Entwickler', status: 'open' }
		});
		const postings = await jobBoard.listOpenPostings();
		expect(postings.map((p) => p.title)).toEqual(['Frontend-Entwickler']);
	});

	it.each([
		{ case: 'an empty title', input: { title: '   ', description: 'Text' }, field: 'title' },
		{ case: 'a too short title', input: { title: 'QA', description: 'Text' }, field: 'title' },
		{
			case: 'a too long title',
			input: { title: 'x'.repeat(121), description: 'Text' },
			field: 'title'
		},
		{
			case: 'an empty description',
			input: { title: 'Designer', description: '' },
			field: 'description'
		},
		{
			case: 'a too long description',
			input: { title: 'Designer', description: 'x'.repeat(10_001) },
			field: 'description'
		}
	])('rejects $case with a field error and stores nothing', async ({ input, field }) => {
		const recruiter = await insertRecruiter();

		const result = await jobBoard.createPosting(recruiter.id, input);

		expect(result).toMatchObject({
			type: 'invalid',
			fieldErrors: { [field]: [expect.any(String)] }
		});
		expect(await jobBoard.listOpenPostings()).toEqual([]);
	});
});

describe('listOwnPostings', () => {
	it("lists the recruiter's own job postings with their posting status, and no one else's", async () => {
		const recruiterA = await insertRecruiter();
		const recruiterB = await insertRecruiter();
		await insertJobPosting({ recruiterId: recruiterA.id, title: 'Buchhalter', status: 'open' });
		await insertJobPosting({ recruiterId: recruiterA.id, title: 'Lagerist', status: 'closed' });
		await insertJobPosting({ recruiterId: recruiterB.id, title: 'Fremde Stelle' });

		const postings = await jobBoard.listOwnPostings(recruiterA.id);

		expect(postings.map(({ title, status }) => ({ title, status }))).toEqual(
			expect.arrayContaining([
				{ title: 'Buchhalter', status: 'open' },
				{ title: 'Lagerist', status: 'closed' }
			])
		);
		expect(postings).toHaveLength(2);
	});
});
