import type { Handle } from '@sveltejs/kit';
import { verifyAccessToken, rotateRefreshToken, issueAccessToken, getUserById } from '$lib/server/auth';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

const COOKIE_BASE = {
	httpOnly: true,
	sameSite: 'lax',
	path: '/'
} as const;

export const handle: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get(ACCESS_COOKIE);
	const refreshToken = event.cookies.get(REFRESH_COOKIE);

	let userId: string | null = null;

	if (accessToken) {
		userId = await verifyAccessToken(accessToken);
	}

	if (!userId && refreshToken) {
		const rotated = await rotateRefreshToken(refreshToken);
		if (rotated) {
			userId = rotated.userId;
			const newAccess = await issueAccessToken(userId);

			event.cookies.set(ACCESS_COOKIE, newAccess, {
				...COOKIE_BASE,
				maxAge: 15 * 60
			});
			event.cookies.set(REFRESH_COOKIE, rotated.newToken, {
				...COOKIE_BASE,
				maxAge: 30 * 24 * 60 * 60
			});
		} else {
			event.cookies.delete(REFRESH_COOKIE, { path: '/' });
		}
	}

	if (userId) {
		const user = await getUserById(userId);
		if (user) {
			event.locals.user = user;
		}
	}

	return resolve(event);
};
