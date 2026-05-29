import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { meetings, tickets } from '$lib/server/db/schema';
import { gte, lte, and, asc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/login');

	const yearParam = url.searchParams.get('year');
	const monthParam = url.searchParams.get('month');

	const now = new Date();
	const year = yearParam ? parseInt(yearParam) : now.getFullYear();
	const month = monthParam ? parseInt(monthParam) : now.getMonth();

	const start = new Date(year, month, 1);
	const end = new Date(year, month + 1, 0, 23, 59, 59);

	const rows = await db
		.select({
			id: meetings.id,
			title: meetings.title,
			description: meetings.description,
			startsAt: meetings.startsAt,
			endsAt: meetings.endsAt,
			ticketId: meetings.ticketId,
			ticketTitle: tickets.title
		})
		.from(meetings)
		.leftJoin(tickets, eq(meetings.ticketId, tickets.id))
		.where(and(gte(meetings.startsAt, start), lte(meetings.startsAt, end)))
		.orderBy(asc(meetings.startsAt));

	return { meetings: rows, year, month };
};
