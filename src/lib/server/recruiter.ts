import { redirect } from '@sveltejs/kit';

// The handle hook already guards /recruiter; this narrows the type and is a second line of defence.
export function requireRecruiterId(locals: App.Locals): string {
	if (!locals.user) redirect(303, '/login');
	return locals.user.id;
}
