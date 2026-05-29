import bcrypt from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '$env/dynamic/private';
import { db } from './db/index';
import { refreshTokens, users } from './db/schema';
import { eq, and, gt } from 'drizzle-orm';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = 15 * 60; // 15 minutes in seconds
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getJwtSecret(): Uint8Array {
	if (!env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
	return new TextEncoder().encode(env.JWT_SECRET);
}

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export async function issueAccessToken(userId: string): Promise<string> {
	return new SignJWT({ sub: userId })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(`${ACCESS_TOKEN_TTL}s`)
		.sign(getJwtSecret());
}

export async function verifyAccessToken(token: string): Promise<string | null> {
	try {
		const { payload } = await jwtVerify(token, getJwtSecret());
		return payload.sub ?? null;
	} catch {
		return null;
	}
}

export function generateRefreshToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

async function hashToken(token: string): Promise<string> {
	const data = new TextEncoder().encode(token);
	const hash = await crypto.subtle.digest('SHA-256', data);
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export async function storeRefreshToken(userId: string, token: string): Promise<void> {
	const tokenHash = await hashToken(token);
	const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
	await db.insert(refreshTokens).values({ userId, tokenHash, expiresAt });
}

export async function rotateRefreshToken(
	oldToken: string
): Promise<{ userId: string; newToken: string } | null> {
	const oldHash = await hashToken(oldToken);
	const now = new Date();

	const [row] = await db
		.select()
		.from(refreshTokens)
		.where(and(eq(refreshTokens.tokenHash, oldHash), gt(refreshTokens.expiresAt, now)))
		.limit(1);

	if (!row) return null;

	await db.delete(refreshTokens).where(eq(refreshTokens.id, row.id));

	const newToken = generateRefreshToken();
	await storeRefreshToken(row.userId, newToken);

	return { userId: row.userId, newToken };
}

export async function revokeAllRefreshTokens(userId: string): Promise<void> {
	await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
}

export async function getUserById(
	userId: string
): Promise<{ id: string; email: string; name: string } | null> {
	const [user] = await db
		.select({ id: users.id, email: users.email, name: users.name })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);
	return user ?? null;
}
