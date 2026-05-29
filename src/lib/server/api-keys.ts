import { db } from './db/index';
import { apiKeys } from './db/schema';
import { eq } from 'drizzle-orm';

async function hashKey(key: string): Promise<string> {
	const data = new TextEncoder().encode(key);
	const hash = await crypto.subtle.digest('SHA-256', data);
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export function generateApiKey(): { key: string; prefix: string } {
	const prefixBytes = crypto.getRandomValues(new Uint8Array(4));
	const keyBytes = crypto.getRandomValues(new Uint8Array(24));
	const prefix = Array.from(prefixBytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	const secret = Array.from(keyBytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return { key: `tsk_${prefix}_${secret}`, prefix };
}

export async function createApiKey(name: string): Promise<{ id: string; key: string; prefix: string }> {
	const { key, prefix } = generateApiKey();
	const keyHash = await hashKey(key);
	const [row] = await db.insert(apiKeys).values({ name, keyPrefix: prefix, keyHash }).returning({ id: apiKeys.id });
	return { id: row.id, key, prefix };
}

export async function validateApiKey(key: string): Promise<boolean> {
	const keyHash = await hashKey(key);
	const [row] = await db
		.select({ id: apiKeys.id, isActive: apiKeys.isActive })
		.from(apiKeys)
		.where(eq(apiKeys.keyHash, keyHash))
		.limit(1);

	if (!row || !row.isActive) return false;

	await db
		.update(apiKeys)
		.set({ lastUsedAt: new Date() })
		.where(eq(apiKeys.id, row.id));

	return true;
}

export async function revokeApiKey(id: string): Promise<void> {
	await db
		.update(apiKeys)
		.set({ isActive: false, revokedAt: new Date() })
		.where(eq(apiKeys.id, id));
}

export async function listApiKeys() {
	return db
		.select({
			id: apiKeys.id,
			name: apiKeys.name,
			keyPrefix: apiKeys.keyPrefix,
			createdAt: apiKeys.createdAt,
			lastUsedAt: apiKeys.lastUsedAt,
			isActive: apiKeys.isActive
		})
		.from(apiKeys)
		.orderBy(apiKeys.createdAt);
}
