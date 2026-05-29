import {
	pgTable,
	pgEnum,
	uuid,
	text,
	timestamp,
	boolean
} from 'drizzle-orm/pg-core';

export const ticketTypeEnum = pgEnum('ticket_type', [
	'mobile',
	'web',
	'system_design',
	'tutoring',
	'other'
]);

export const ticketStatusEnum = pgEnum('ticket_status', [
	'open',
	'in_progress',
	'resolved',
	'closed'
]);

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const refreshTokens = pgTable('refresh_tokens', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	tokenHash: text('token_hash').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const tickets = pgTable('tickets', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	type: ticketTypeEnum('type').notNull(),
	contactName: text('contact_name').notNull(),
	contactEmail: text('contact_email').notNull(),
	status: ticketStatusEnum('status').notNull().default('open'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const ticketNotes = pgTable('ticket_notes', {
	id: uuid('id').primaryKey().defaultRandom(),
	ticketId: uuid('ticket_id')
		.notNull()
		.references(() => tickets.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const meetings = pgTable('meetings', {
	id: uuid('id').primaryKey().defaultRandom(),
	ticketId: uuid('ticket_id').references(() => tickets.id, { onDelete: 'set null' }),
	title: text('title').notNull(),
	description: text('description'),
	startsAt: timestamp('starts_at').notNull(),
	endsAt: timestamp('ends_at'),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const apiKeys = pgTable('api_keys', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	keyPrefix: text('key_prefix').notNull(),
	keyHash: text('key_hash').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	lastUsedAt: timestamp('last_used_at'),
	revokedAt: timestamp('revoked_at'),
	isActive: boolean('is_active').notNull().default(true)
});
