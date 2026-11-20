import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { auth } from '#lib/server/auth.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';

export const handle: Handle = async ({ event, resolve }) => {
	const authSession = await auth.api.getSession({ headers: event.request.headers });

	if (authSession) {
		event.locals.session = authSession.session;
		event.locals.user = authSession.user;
	}

	// Guarding here (not in a layout load) also protects form actions under /recruiter.
	if (!event.locals.user && isRecruiterPath(event.url.pathname)) {
		redirect(303, '/login');
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

function isRecruiterPath(pathname: string) {
	return pathname === '/recruiter' || pathname.startsWith('/recruiter/');
}
