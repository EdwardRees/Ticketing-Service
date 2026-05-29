import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { revokeAllRefreshTokens } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ cookies, locals }) => {
		if (locals.user) {
			await revokeAllRefreshTokens(locals.user.id);
		}
		cookies.delete('access_token', { path: '/' });
		cookies.delete('refresh_token', { path: '/' });
		redirect(302, '/login');
	}
};
