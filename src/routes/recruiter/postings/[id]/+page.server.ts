import { error } from '@sveltejs/kit';
import { jobBoard } from '#lib/server/app.ts';
import { requireRecruiterId } from '#lib/server/recruiter.ts';
import { applicationNotFound, postingNotFound } from '#lib/server/responses.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const recruiterId = requireRecruiterId(locals);
	const [posting, listed] = await Promise.all([
		jobBoard.getOwnPosting(recruiterId, params.id),
		jobBoard.listApplications(recruiterId, params.id)
	]);
	if (posting.type === 'not-found' || listed.type === 'not-found') postingNotFound();

	const { id, title, status } = posting.posting;
	return { posting: { id, title, status }, applications: listed.applications };
};

export const actions: Actions = {
	setStatus: async ({ request, locals }) => {
		const recruiterId = requireRecruiterId(locals);
		const formData = await request.formData();
		const applicationId = formData.get('applicationId');
		const status = formData.get('status');

		const result = await jobBoard.setApplicationStatus(
			recruiterId,
			typeof applicationId === 'string' ? applicationId : '',
			typeof status === 'string' ? status : ''
		);
		if (result.type === 'not-found') applicationNotFound();
		if (result.type === 'invalid') error(400, 'Ungültiger Status.');
	}
};
