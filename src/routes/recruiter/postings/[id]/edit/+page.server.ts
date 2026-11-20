import { error, redirect } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { jobPostingSchema } from '#lib/schemas/job-posting.ts';
import { jobBoard } from '#lib/server/app.ts';
import { failWithFieldErrors, formText, postingNotFound } from '#lib/server/responses.ts';
import { requireRecruiterId } from '#lib/server/recruiter.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const result = await jobBoard.getOwnPosting(requireRecruiterId(locals), params.id);
	if (result.type === 'not-found') postingNotFound();

	const { title, description, status } = result.posting;
	return {
		status,
		form: await superValidate({ title, description }, zod4(jobPostingSchema))
	};
};

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		const recruiterId = requireRecruiterId(locals);
		const form = await superValidate(request, zod4(jobPostingSchema));
		if (!form.valid) return fail(400, { form });

		const result = await jobBoard.updatePosting(recruiterId, params.id, form.data);
		if (result.type === 'not-found') postingNotFound();
		if (result.type === 'invalid') {
			return failWithFieldErrors(form, result.fieldErrors);
		}

		redirect(303, '/recruiter');
	},

	setStatus: async ({ request, locals, params }) => {
		const recruiterId = requireRecruiterId(locals);
		const status = formText(await request.formData(), 'status');

		const result = await jobBoard.setPostingStatus(recruiterId, params.id, status);
		if (result.type === 'not-found') postingNotFound();
		if (result.type === 'invalid') error(400, 'Ungültiger Status.');
	}
};
