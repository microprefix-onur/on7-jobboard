import { redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { loginSchema } from '#lib/schemas/auth.ts';
import { auth } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/recruiter');
	return { form: await superValidate(zod4(loginSchema)) };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(loginSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await auth.api.signInEmail({ body: form.data });
		} catch (error) {
			if (error instanceof APIError && error.status === 'UNAUTHORIZED') {
				return message(form, 'E-Mail-Adresse oder Passwort ist falsch.', { status: 400 });
			}
			throw error;
		}

		redirect(303, '/recruiter');
	}
};
