import { error } from '@sveltejs/kit';
import { fail, setError, type SuperValidated } from 'sveltekit-superforms';

export function postingNotFound(): never {
	error(404, 'Diese Stelle gibt es nicht.');
}

export function applicationNotFound(): never {
	error(404, 'Diese Bewerbung gibt es nicht.');
}

// Maps the domain module's field errors onto a Superforms form.
export function failWithFieldErrors<T extends Record<string, unknown>>(
	form: SuperValidated<T>,
	fieldErrors: Partial<Record<keyof T, string[]>>
) {
	for (const [field, messages] of Object.entries(fieldErrors) as [keyof T & string, string[]][]) {
		setError(form as SuperValidated<Record<string, unknown>>, field, messages);
	}
	return fail(400, { form });
}

// Reads a plain form field; anything else (missing, a file) becomes an empty string.
export function formText(formData: FormData, name: string): string {
	const value = formData.get(name);
	return typeof value === 'string' ? value : '';
}
