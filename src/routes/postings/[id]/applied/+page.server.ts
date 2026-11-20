import { error } from '@sveltejs/kit';
import { jobBoard } from '#lib/server/app.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const result = await jobBoard.getPublicPosting(params.id);
	if (result.type === 'not-found') error(404, 'Diese Stelle gibt es nicht.');

	return { title: result.posting.title };
};
