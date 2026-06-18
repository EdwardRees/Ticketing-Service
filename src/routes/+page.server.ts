import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { tickets } from '$lib/server/db/schema';
import { eq, count, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const [open] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'open'));
	const [inProgress] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'in_progress'));
	const [resolved] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'resolved'));
	const [closed] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'closed'));

	const recent = await db
		.select()
		.from(tickets)
		.orderBy(tickets.createdAt)
		.limit(5);

	const allTickets = await db
		.select()
		.from(tickets)
		.orderBy(desc(tickets.createdAt));

	return {
		stats: {
			open: open.count,
			inProgress: inProgress.count,
			resolved: resolved.count,
			closed: closed.count
		},
		recent,
		byStatus: {
			open: allTickets.filter((t) => t.status === 'open'),
			in_progress: allTickets.filter((t) => t.status === 'in_progress'),
			resolved: allTickets.filter((t) => t.status === 'resolved'),
			closed: allTickets.filter((t) => t.status === 'closed')
		}
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const ticketId = String(data.get('ticketId') ?? '').trim();
		const status = String(data.get('status') ?? '') as
			| 'open'
			| 'in_progress'
			| 'resolved'
			| 'closed';

		const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
		if (!ticketId || !validStatuses.includes(status)) {
			return fail(400, { error: 'Invalid request.' });
		}

		await db
			.update(tickets)
			.set({ status, updatedAt: new Date() })
			.where(eq(tickets.id, ticketId));

		return { success: true };
	}
};
