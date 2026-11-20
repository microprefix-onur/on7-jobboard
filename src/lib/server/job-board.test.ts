import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createJobBoard } from './job-board';
import { insertApplication, insertJobPosting, insertRecruiter, testDb } from '../../../test/db';

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

describe('listOwnPostings application counts', () => {
	it('counts the applications of each own job posting, including zero', async () => {
		const recruiter = await insertRecruiter();
		const busy = await insertJobPosting({ recruiterId: recruiter.id, title: 'Gefragt' });
		await insertJobPosting({ recruiterId: recruiter.id, title: 'Ruhig' });
		const foreign = await insertJobPosting({ title: 'Fremd' });
		await insertApplication({ jobPostingId: busy.id });
		await insertApplication({ jobPostingId: busy.id });
		await insertApplication({ jobPostingId: foreign.id });

		const postings = await jobBoard.listOwnPostings(recruiter.id);

		expect(postings.map(({ title, applicationCount }) => ({ title, applicationCount }))).toEqual(
			expect.arrayContaining([
				{ title: 'Gefragt', applicationCount: 2 },
				{ title: 'Ruhig', applicationCount: 0 }
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

describe('submitApplication', () => {
	const applicant = {
		name: 'Alex Applicant',
		email: 'alex@example.com',
		coverText: 'Ich koche gern.'
	};

	it('accepts an application to an open job posting, starting as new', async () => {
		const posting = await insertJobPosting({ status: 'open' });

		const result = await jobBoard.submitApplication(posting.id, {
			...applicant,
			email: '  Alex@Example.COM '
		});

		expect(result).toMatchObject({
			type: 'success',
			application: {
				jobPostingId: posting.id,
				applicantName: 'Alex Applicant',
				applicantEmail: 'alex@example.com',
				coverText: 'Ich koche gern.',
				status: 'new'
			}
		});
	});

	it('rejects an application to a closed job posting and saves nothing', async () => {
		const recruiter = await insertRecruiter();
		const posting = await insertJobPosting({ recruiterId: recruiter.id, status: 'closed' });

		expect(await jobBoard.submitApplication(posting.id, applicant)).toEqual({
			type: 'posting-closed'
		});

		// Nothing was saved: once reopened, the same email can still apply.
		await jobBoard.setPostingStatus(recruiter.id, posting.id, 'open');
		expect(await jobBoard.submitApplication(posting.id, applicant)).toMatchObject({
			type: 'success'
		});
	});

	it('rejects a second application with the same email to the same job posting', async () => {
		const posting = await insertJobPosting();
		await jobBoard.submitApplication(posting.id, applicant);

		expect(
			await jobBoard.submitApplication(posting.id, { ...applicant, email: ' ALEX@example.com ' })
		).toEqual({ type: 'already-applied' });
	});

	it('lets only one of two simultaneous applications with the same email through', async () => {
		const posting = await insertJobPosting();

		const results = await Promise.all([
			jobBoard.submitApplication(posting.id, applicant),
			jobBoard.submitApplication(posting.id, applicant)
		]);

		expect(results.map((r) => r.type).sort()).toEqual(['already-applied', 'success']);
	});

	it('accepts the same email on a different job posting', async () => {
		const first = await insertJobPosting();
		const second = await insertJobPosting();
		await jobBoard.submitApplication(first.id, applicant);

		expect(await jobBoard.submitApplication(second.id, applicant)).toMatchObject({
			type: 'success'
		});
	});

	it.each([
		{ case: 'an empty name', input: { name: '  ' }, field: 'name' },
		{ case: 'a too long name', input: { name: 'x'.repeat(101) }, field: 'name' },
		{ case: 'a malformed email', input: { email: 'alex@' }, field: 'email' },
		{
			case: 'a too long email',
			input: { email: `${'x'.repeat(250)}@example.com` },
			field: 'email'
		},
		{ case: 'an empty cover text', input: { coverText: '' }, field: 'coverText' },
		{ case: 'a too long cover text', input: { coverText: 'x'.repeat(2001) }, field: 'coverText' }
	])('rejects $case with a field error', async ({ input, field }) => {
		const posting = await insertJobPosting();

		expect(await jobBoard.submitApplication(posting.id, { ...applicant, ...input })).toEqual({
			type: 'invalid',
			fieldErrors: { [field]: [expect.any(String)] }
		});
	});

	it('returns not found for an unknown or malformed job posting id', async () => {
		for (const id of [randomUUID(), 'not-a-uuid']) {
			expect(await jobBoard.submitApplication(id, applicant)).toEqual({ type: 'not-found' });
		}
	});
});

describe('getPublicPosting', () => {
	it('returns open and closed job postings without revealing the recruiter', async () => {
		const open = await insertJobPosting({ title: 'Gärtner', description: 'Zeile 1\nZeile 2' });
		const closed = await insertJobPosting({ title: 'Maler', status: 'closed' });

		expect(await jobBoard.getPublicPosting(open.id)).toEqual({
			type: 'success',
			posting: { id: open.id, title: 'Gärtner', description: 'Zeile 1\nZeile 2', status: 'open' }
		});
		expect(await jobBoard.getPublicPosting(closed.id)).toMatchObject({
			type: 'success',
			posting: { title: 'Maler', status: 'closed' }
		});
	});

	it('returns not found for an unknown or malformed id', async () => {
		for (const id of [randomUUID(), 'not-a-uuid']) {
			expect(await jobBoard.getPublicPosting(id)).toEqual({ type: 'not-found' });
		}
	});
});

describe('listApplications', () => {
	it('lists the applications to an own job posting, newest first', async () => {
		const recruiter = await insertRecruiter();
		const posting = await insertJobPosting({ recruiterId: recruiter.id });
		const otherPosting = await insertJobPosting({ recruiterId: recruiter.id });
		await insertApplication({
			jobPostingId: posting.id,
			applicantName: 'Erste',
			createdAt: new Date('2026-11-01T10:00:00Z')
		});
		await insertApplication({
			jobPostingId: posting.id,
			applicantName: 'Zweite',
			applicantEmail: 'zweite@example.com',
			coverText: 'Zeile 1\nZeile 2',
			status: 'invited',
			createdAt: new Date('2026-11-02T10:00:00Z')
		});
		await insertApplication({ jobPostingId: otherPosting.id, applicantName: 'Andere Stelle' });

		const result = await jobBoard.listApplications(recruiter.id, posting.id);

		expect(result.type).toBe('success');
		if (result.type !== 'success') return;
		expect(result.applications.map((a) => a.applicantName)).toEqual(['Zweite', 'Erste']);
		expect(result.applications[0]).toMatchObject({
			applicantName: 'Zweite',
			applicantEmail: 'zweite@example.com',
			coverText: 'Zeile 1\nZeile 2',
			status: 'invited',
			createdAt: new Date('2026-11-02T10:00:00Z')
		});
	});

	it("returns not found for another recruiter's job posting, an unknown id and a malformed id", async () => {
		const recruiterB = await insertRecruiter();
		const postingOfA = await insertJobPosting();
		await insertApplication({ jobPostingId: postingOfA.id });

		for (const id of [postingOfA.id, randomUUID(), 'not-a-uuid']) {
			expect(await jobBoard.listApplications(recruiterB.id, id)).toEqual({ type: 'not-found' });
		}
	});
});

describe('setApplicationStatus', () => {
	it('changes the application status in any direction, also on a closed job posting', async () => {
		const recruiter = await insertRecruiter();
		const posting = await insertJobPosting({ recruiterId: recruiter.id, status: 'closed' });
		const { id } = await insertApplication({ jobPostingId: posting.id });

		for (const status of ['invited', 'rejected', 'new', 'rejected', 'invited', 'new']) {
			expect(await jobBoard.setApplicationStatus(recruiter.id, id, status)).toMatchObject({
				type: 'success'
			});
			const listed = await jobBoard.listApplications(recruiter.id, posting.id);
			expect(listed).toMatchObject({ applications: [{ id, status }] });
		}
	});

	it('rejects a status other than new, invited or rejected', async () => {
		const recruiter = await insertRecruiter();
		const posting = await insertJobPosting({ recruiterId: recruiter.id });
		const { id } = await insertApplication({ jobPostingId: posting.id });

		expect(await jobBoard.setApplicationStatus(recruiter.id, id, 'hired')).toEqual({
			type: 'invalid',
			fieldErrors: { status: [expect.any(String)] }
		});
		expect(await jobBoard.listApplications(recruiter.id, posting.id)).toMatchObject({
			applications: [{ id, status: 'new' }]
		});
	});

	it("returns not found for another recruiter's application, an unknown id and a malformed id", async () => {
		const recruiterA = await insertRecruiter();
		const recruiterB = await insertRecruiter();
		const posting = await insertJobPosting({ recruiterId: recruiterA.id });
		const { id } = await insertApplication({ jobPostingId: posting.id });

		for (const applicationId of [id, randomUUID(), 'not-a-uuid']) {
			expect(await jobBoard.setApplicationStatus(recruiterB.id, applicationId, 'rejected')).toEqual(
				{ type: 'not-found' }
			);
		}
		expect(await jobBoard.listApplications(recruiterA.id, posting.id)).toMatchObject({
			applications: [{ id, status: 'new' }]
		});
	});
});
