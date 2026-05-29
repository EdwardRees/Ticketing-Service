import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { tickets } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const title = String(data.get('title') ?? '').trim();
		const description = String(data.get('description') ?? '').trim();
		const type = String(data.get('type') ?? '') as
			| 'mobile'
			| 'web'
			| 'system_design'
			| 'tutoring'
			| 'other';
		const contactName = String(data.get('contactName') ?? '').trim();
		const contactEmail = String(data.get('contactEmail') ?? '').trim().toLowerCase();

		if (!title || !description || !type || !contactName || !contactEmail) {
			return fail(400, { error: 'All fields are required.' });
		}

		const validTypes = ['mobile', 'web', 'system_design', 'tutoring', 'other'];
		if (!validTypes.includes(type)) {
			return fail(400, { error: 'Invalid ticket type.' });
		}

		const [ticket] = await db
			.insert(tickets)
			.values({ title, description, type, contactName, contactEmail })
			.returning({ id: tickets.id });

		redirect(302, `/tickets/${ticket.id}`);
	}
};
