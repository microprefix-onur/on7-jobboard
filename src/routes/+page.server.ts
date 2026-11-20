import { jobBoard } from '#lib/server/app.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { postings: await jobBoard.listOpenPostings() };
};
