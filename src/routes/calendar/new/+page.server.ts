import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { meetings, tickets } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/login');

	const allTickets = await db
		.select({ id: tickets.id, title: tickets.title })
		.from(tickets)
		.orderBy(asc(tickets.createdAt));

	const preselectedTicketId = url.searchParams.get('ticketId') ?? '';

	return { tickets: allTickets, preselectedTicketId };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const title = String(data.get('title') ?? '').trim();
		const description = String(data.get('description') ?? '').trim() || null;
		const startsAtRaw = String(data.get('startsAt') ?? '');
		const endsAtRaw = String(data.get('endsAt') ?? '').trim();
		const ticketId = String(data.get('ticketId') ?? '').trim() || null;

		if (!title || !startsAtRaw) {
			return fail(400, { error: 'Title and start time are required.' });
		}

		const startsAt = new Date(startsAtRaw);
		const endsAt = endsAtRaw ? new Date(endsAtRaw) : null;

		if (isNaN(startsAt.getTime())) {
			return fail(400, { error: 'Invalid start time.' });
		}

		await db.insert(meetings).values({
			title,
			description,
			startsAt,
			endsAt: endsAt ?? undefined,
			ticketId
		});

		redirect(302, '/calendar');
	}
};
