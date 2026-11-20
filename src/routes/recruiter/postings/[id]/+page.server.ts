import { error } from '@sveltejs/kit';
import { jobBoard } from '#lib/server/app.ts';
import { requireRecruiterId } from '#lib/server/recruiter.ts';
import { applicationNotFound, formText, postingNotFound } from '#lib/server/responses.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const result = await jobBoard.listApplications(requireRecruiterId(locals), params.id);
	if (result.type === 'not-found') postingNotFound();

	return { posting: result.posting, applications: result.applications };
};

export const actions: Actions = {
	setStatus: async ({ request, locals }) => {
		const recruiterId = requireRecruiterId(locals);
		const formData = await request.formData();

		const result = await jobBoard.setApplicationStatus(
			recruiterId,
			formText(formData, 'applicationId'),
			formText(formData, 'status')
		);
		if (result.type === 'not-found') applicationNotFound();
		if (result.type === 'invalid') error(400, 'Ungültiger Status.');
	}
};
