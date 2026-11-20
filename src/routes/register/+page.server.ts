import { redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { registerSchema } from '#lib/schemas/auth.ts';
import { auth } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/recruiter');
	return { form: await superValidate(zod4(registerSchema)) };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(registerSchema));
		if (!form.valid) return fail(400, { form });

		try {
			// Signing up also signs the recruiter in.
			await auth.api.signUpEmail({ body: form.data });
		} catch (error) {
			if (error instanceof APIError && error.body?.code?.startsWith('USER_ALREADY_EXISTS')) {
				return setError(form, 'email', 'Mit dieser E-Mail-Adresse gibt es schon ein Konto.');
			}
			throw error;
		}

		redirect(303, '/recruiter');
	}
};
