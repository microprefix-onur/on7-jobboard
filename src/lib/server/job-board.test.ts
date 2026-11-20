import { randomUUID } from 'node:crypto';
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

describe('getOwnPosting', () => {
	it("returns the recruiter's own job posting", async () => {
		const recruiter = await insertRecruiter();
		const posting = await insertJobPosting({
			recruiterId: recruiter.id,
			title: 'Buchhalter',
			description: 'Zahlen, bitte.',
			status: 'closed'
		});

		const result = await jobBoard.getOwnPosting(recruiter.id, posting.id);

		expect(result).toMatchObject({
			type: 'success',
			posting: {
				id: posting.id,
				title: 'Buchhalter',
				description: 'Zahlen, bitte.',
				status: 'closed'
			}
		});
	});

	it("returns not found for another recruiter's job posting, an unknown id and a malformed id", async () => {
		const recruiterB = await insertRecruiter();
		const postingOfA = await insertJobPosting();

		for (const id of [postingOfA.id, randomUUID(), 'not-a-uuid']) {
			expect(await jobBoard.getOwnPosting(recruiterB.id, id)).toEqual({ type: 'not-found' });
		}
	});
});

describe('updatePosting', () => {
	it('changes the title and description of an own job posting', async () => {
		const recruiter = await insertRecruiter();
		const posting = await insertJobPosting({ recruiterId: recruiter.id, title: 'Alter Titel' });

		const result = await jobBoard.updatePosting(recruiter.id, posting.id, {
			title: ' Neuer Titel ',
			description: 'Neue Beschreibung.'
		});

		expect(result).toMatchObject({ type: 'success' });
		expect(await jobBoard.getOwnPosting(recruiter.id, posting.id)).toMatchObject({
			posting: { title: 'Neuer Titel', description: 'Neue Beschreibung.', status: 'open' }
		});
	});

	it('rejects invalid input with field errors and keeps the job posting unchanged', async () => {
		const recruiter = await insertRecruiter();
		const posting = await insertJobPosting({ recruiterId: recruiter.id, title: 'Alter Titel' });

		const result = await jobBoard.updatePosting(recruiter.id, posting.id, {
			title: 'QA',
			description: ''
		});

		expect(result).toMatchObject({
			type: 'invalid',
			fieldErrors: { title: [expect.any(String)], description: [expect.any(String)] }
		});
		expect(await jobBoard.getOwnPosting(recruiter.id, posting.id)).toMatchObject({
			posting: { title: 'Alter Titel' }
		});
	});

	it("returns not found for another recruiter's job posting and leaves it unchanged", async () => {
		const recruiterA = await insertRecruiter();
		const recruiterB = await insertRecruiter();
		const posting = await insertJobPosting({ recruiterId: recruiterA.id, title: 'Alter Titel' });
		const input = { title: 'Übernommen', description: 'Fremd.' };

		for (const id of [posting.id, randomUUID(), 'not-a-uuid']) {
			expect(await jobBoard.updatePosting(recruiterB.id, id, input)).toEqual({ type: 'not-found' });
		}
		expect(await jobBoard.getOwnPosting(recruiterA.id, posting.id)).toMatchObject({
			posting: { title: 'Alter Titel' }
		});
	});
});

describe('setPostingStatus', () => {
	it('closing removes a job posting from the public list and reopening puts it back', async () => {
		const recruiter = await insertRecruiter();
		const posting = await insertJobPosting({ recruiterId: recruiter.id, title: 'Koch' });

		expect(await jobBoard.setPostingStatus(recruiter.id, posting.id, 'closed')).toMatchObject({
			type: 'success',
			posting: { status: 'closed' }
		});
		expect(await jobBoard.listOpenPostings()).toEqual([]);

		await jobBoard.setPostingStatus(recruiter.id, posting.id, 'open');
		expect((await jobBoard.listOpenPostings()).map((p) => p.title)).toEqual(['Koch']);
	});

	it('rejects a status other than open or closed and keeps the job posting unchanged', async () => {
		const recruiter = await insertRecruiter();
		const posting = await insertJobPosting({ recruiterId: recruiter.id });

		expect(await jobBoard.setPostingStatus(recruiter.id, posting.id, 'archived')).toMatchObject({
			type: 'invalid',
			fieldErrors: { status: [expect.any(String)] }
		});
		expect(await jobBoard.getOwnPosting(recruiter.id, posting.id)).toMatchObject({
			posting: { status: 'open' }
		});
	});

	it('returns not found when another recruiter closes or reopens a job posting', async () => {
		const recruiterA = await insertRecruiter();
		const recruiterB = await insertRecruiter();
		const posting = await insertJobPosting({ recruiterId: recruiterA.id });

		for (const status of ['closed', 'open']) {
			for (const id of [posting.id, randomUUID(), 'not-a-uuid']) {
				expect(await jobBoard.setPostingStatus(recruiterB.id, id, status)).toEqual({
					type: 'not-found'
				});
			}
		}
		expect(await jobBoard.listOpenPostings()).toHaveLength(1);
	});
});
