import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import {
	verifyPassword,
	issueAccessToken,
	generateRefreshToken,
	storeRefreshToken
} from '$lib/server/auth';

const COOKIE_BASE = {
	httpOnly: true,
	sameSite: 'lax',
	path: '/'
} as const;

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '').trim().toLowerCase();
		const password = String(data.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (!user || !(await verifyPassword(password, user.passwordHash))) {
			return fail(401, { error: 'Invalid email or password.' });
		}

		const accessToken = await issueAccessToken(user.id);
		const refreshToken = generateRefreshToken();
		await storeRefreshToken(user.id, refreshToken);

		cookies.set('access_token', accessToken, { ...COOKIE_BASE, maxAge: 15 * 60 });
		cookies.set('refresh_token', refreshToken, {
			...COOKIE_BASE,
			maxAge: 30 * 24 * 60 * 60
		});

		redirect(302, '/');
	}
};
