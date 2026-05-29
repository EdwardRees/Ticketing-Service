import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { tickets } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';

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

	return {
		stats: {
			open: open.count,
			inProgress: inProgress.count,
			resolved: resolved.count,
			closed: closed.count
		},
		recent
	};
};
