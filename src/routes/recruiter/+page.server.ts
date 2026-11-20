import { jobBoard } from '#lib/server/app.ts';
import { requireRecruiterId } from '#lib/server/recruiter.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return { postings: await jobBoard.listOwnPostings(requireRecruiterId(locals)) };
};
