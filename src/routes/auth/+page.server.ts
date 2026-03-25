import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { session } = await locals.safeGetSession();
	if (session) {
		throw redirect(303, '/');
	}
	const oauthError = url.searchParams.get('error');
	return { oauthError: oauthError ?? undefined };
};
