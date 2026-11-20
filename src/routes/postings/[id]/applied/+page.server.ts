import { jobBoard } from '#lib/server/app.ts';
import { postingNotFound } from '#lib/server/responses.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const result = await jobBoard.getPublicPosting(params.id);
	if (result.type === 'not-found') postingNotFound();

	return { title: result.posting.title };
};
