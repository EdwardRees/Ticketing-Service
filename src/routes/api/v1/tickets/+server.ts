import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { tickets } from '$lib/server/db/schema';
import { validateApiKey } from '$lib/server/api-keys';
import { desc } from 'drizzle-orm';

async function authenticate(request: Request): Promise<boolean> {
	const authHeader = request.headers.get('Authorization');
	const apiKeyHeader = request.headers.get('X-API-Key');

	const key = apiKeyHeader ?? (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);
	if (!key) return false;
	return validateApiKey(key);
}

export const GET: RequestHandler = async ({ request }) => {
	if (!(await authenticate(request))) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const rows = await db.select().from(tickets).orderBy(desc(tickets.createdAt));
	return json({ tickets: rows });
};

export const POST: RequestHandler = async ({ request }) => {
	if (!(await authenticate(request))) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const b = body as Record<string, unknown>;
	const title = typeof b.title === 'string' ? b.title.trim() : '';
	const description = typeof b.description === 'string' ? b.description.trim() : '';
	const type = typeof b.type === 'string' ? b.type : '';
	const contactName = typeof b.contact_name === 'string' ? b.contact_name.trim() : '';
	const contactEmail =
		typeof b.contact_email === 'string' ? b.contact_email.trim().toLowerCase() : '';

	if (!title || !description || !contactName || !contactEmail) {
		return json({ error: 'title, description, contact_name, and contact_email are required.' }, { status: 400 });
	}

	const validTypes = ['mobile', 'web', 'system_design', 'tutoring', 'other'];
	const resolvedType = validTypes.includes(type)
		? (type as 'mobile' | 'web' | 'system_design' | 'tutoring' | 'other')
		: 'other';

	const [ticket] = await db
		.insert(tickets)
		.values({ title, description, type: resolvedType, contactName, contactEmail })
		.returning();

	return json({ ticket }, { status: 201 });
};
