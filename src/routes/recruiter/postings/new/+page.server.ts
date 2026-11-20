import { redirect } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { jobPostingSchema } from '#lib/schemas/job-posting.ts';
import { jobBoard } from '#lib/server/app.ts';
import { failWithFieldErrors } from '#lib/server/responses.ts';
import { requireRecruiterId } from '#lib/server/recruiter.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod4(jobPostingSchema)) };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const recruiterId = requireRecruiterId(locals);
		const form = await superValidate(request, zod4(jobPostingSchema));
		if (!form.valid) return fail(400, { form });

		const result = await jobBoard.createPosting(recruiterId, form.data);
		if (result.type === 'invalid') {
			return failWithFieldErrors(form, result.fieldErrors);
		}

		redirect(303, '/recruiter');
	}
};
