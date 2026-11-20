import { error, redirect } from '@sveltejs/kit';
import { fail, message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { applicationSchema } from '#lib/schemas/application.ts';
import { jobBoard } from '#lib/server/app.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const result = await jobBoard.getPublicPosting(params.id);
	if (result.type === 'not-found') postingNotFound();

	return { posting: result.posting, form: await superValidate(zod4(applicationSchema)) };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await superValidate(request, zod4(applicationSchema));
		if (!form.valid) return fail(400, { form });

		const result = await jobBoard.submitApplication(params.id, form.data);
		switch (result.type) {
			case 'success':
				redirect(303, `/postings/${params.id}/applied`);
				break;
			case 'invalid':
				for (const [field, messages] of Object.entries(result.fieldErrors)) {
					setError(form, field as keyof typeof form.data, messages ?? []);
				}
				return fail(400, { form });
			case 'already-applied':
				return setError(
					form,
					'email',
					'Mit dieser E-Mail-Adresse hast du dich auf diese Stelle schon beworben.',
					{ status: 409 }
				);
			case 'posting-closed':
				return message(form, 'Diese Stelle ist inzwischen geschlossen.', { status: 409 });
			case 'not-found':
				postingNotFound();
		}
	}
};

function postingNotFound(): never {
	error(404, 'Diese Stelle gibt es nicht.');
}
