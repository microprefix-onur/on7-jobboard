import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	return { recruiter: locals.user ? { name: locals.user.name } : null };
};
