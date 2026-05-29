import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { tickets, ticketNotes, meetings } from '$lib/server/db/schema';
import { eq, desc, asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/login');

	const [ticket] = await db.select().from(tickets).where(eq(tickets.id, params.id)).limit(1);
	if (!ticket) error(404, 'Ticket not found');

	const notes = await db
		.select()
		.from(ticketNotes)
		.where(eq(ticketNotes.ticketId, params.id))
		.orderBy(asc(ticketNotes.createdAt));

	const linkedMeetings = await db
		.select()
		.from(meetings)
		.where(eq(meetings.ticketId, params.id))
		.orderBy(asc(meetings.startsAt));

	return { ticket, notes, meetings: linkedMeetings };
};

export const actions: Actions = {
	updateStatus: async ({ request, locals, params }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const status = String(data.get('status') ?? '') as
			| 'open'
			| 'in_progress'
			| 'resolved'
			| 'closed';

		const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
		if (!validStatuses.includes(status)) {
			return fail(400, { error: 'Invalid status.' });
		}

		await db
			.update(tickets)
			.set({ status, updatedAt: new Date() })
			.where(eq(tickets.id, params.id));

		return { success: true };
	},

	addNote: async ({ request, locals, params }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const content = String(data.get('content') ?? '').trim();
		if (!content) return fail(400, { error: 'Note content is required.' });

		await db.insert(ticketNotes).values({ ticketId: params.id, content });
		return { noteAdded: true };
	},

	deleteNote: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const id = String(data.get('id') ?? '').trim();
		if (!id) return fail(400, { error: 'Note ID is required.' });

		await db.delete(ticketNotes).where(eq(ticketNotes.id, id));
		return { noteDeleted: true };
	},

	delete: async ({ locals, params }) => {
		if (!locals.user) redirect(302, '/login');
		await db.delete(tickets).where(eq(tickets.id, params.id));
		redirect(302, '/tickets');
	}
};
