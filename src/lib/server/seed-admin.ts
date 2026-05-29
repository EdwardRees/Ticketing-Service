import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import * as schema from './db/schema';

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] ?? 'Admin';

if (!email || !password) {
	console.error('Usage: bun src/lib/server/seed-admin.ts <email> <password> [name]');
	process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
	console.error('DATABASE_URL is not set');
	process.exit(1);
}

const client = postgres(url);
const db = drizzle(client, { schema });

const [existing] = await db
	.select({ id: schema.users.id })
	.from(schema.users)
	.where(eq(schema.users.email, email))
	.limit(1);

if (existing) {
	console.error(`User with email ${email} already exists.`);
	await client.end();
	process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);
const [user] = await db
	.insert(schema.users)
	.values({ email, passwordHash, name })
	.returning({ id: schema.users.id });

console.log(`Admin user created: ${email} (id: ${user.id})`);
await client.end();
process.exit(0);
