import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listApiKeys, createApiKey, revokeApiKey } from '$lib/server/api-keys';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
	const keys = await listApiKeys();
	return { keys };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();
		if (!name) return fail(400, { error: 'Key name is required.' });

		const { id, key, prefix } = await createApiKey(name);
		return { created: { id, key, prefix } };
	},

	revoke: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = String(data.get('id') ?? '').trim();
		if (!id) return fail(400, { error: 'Key ID is required.' });

		await revokeApiKey(id);
		return { revoked: true };
	}
};
